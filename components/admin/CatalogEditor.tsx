'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deriveCatalog, cumulativeCourses } from '@/lib/catalog/derive'
import { minutesToLabel, UPGRADE_PRICES } from '@/lib/courses'
import { TIER_KEYS, UPGRADE_KEYS } from '@/lib/catalog/types'
import type {
  CatalogDoc,
  CatalogCategory,
  CatalogCourse,
  CatalogTier,
  CatalogBundle,
  CatalogVersionInfo,
  DerivedCatalog,
  TierKey,
} from '@/lib/catalog/types'

const TIER_LABEL: Record<TierKey, string> = { starter: 'Starter', pro: 'Pro', expert: 'Expert' }

// ── helpers de números ──

function parseIntOr(raw: string, fallback: number): number {
  if (raw.trim() === '') return 0
  const n = Math.trunc(Number(raw))
  return Number.isFinite(n) ? n : fallback
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  if (j < 0 || j >= arr.length) return arr
  const copy = [...arr]
  ;[copy[i], copy[j]] = [copy[j], copy[i]]
  return copy
}

// ── helpers de cursos únicos (mismo criterio que lib/catalog/derive.ts, duplicado
// acá porque esa función interna no está exportada) ──

const normTitle = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ')

function uniqueCourses(courses: CatalogCourse[]): CatalogCourse[] {
  const seen = new Map<string, CatalogCourse>()
  for (const c of courses) {
    const k = normTitle(c.title)
    if (!seen.has(k)) seen.set(k, c)
  }
  return [...seen.values()]
}

function sumMinutes(courses: CatalogCourse[]): number {
  return courses.reduce((s, c) => s + (c.minutes ?? 0), 0)
}

function autoUniqueCourses(doc: CatalogDoc): number {
  return uniqueCourses(doc.categories.flatMap(c => cumulativeCourses(c.tiers, 'expert'))).length
}

// ── validación en el cliente, refleja lib/catalog/validate.ts (el servidor manda) ──

function validateClient(doc: CatalogDoc): string[] {
  const errors: string[] = []
  for (const c of doc.categories) {
    const label = c.name.trim() || c.id
    if (!c.name.trim() || c.name.length > 60) errors.push(`${label}: el nombre tiene que tener entre 1 y 60 caracteres`)
    if (c.description.length > 200) errors.push(`${label}: la descripción no puede superar 200 caracteres`)
    for (const t of TIER_KEYS) {
      const tier = c.tiers[t]
      const where = `${label} · ${TIER_LABEL[t]}`
      if (!Number.isInteger(tier.listPrice) || tier.listPrice < 0) errors.push(`${where}: precio de lista inválido`)
      if (!Number.isInteger(tier.price) || tier.price < 0) errors.push(`${where}: precio inválido`)
      if (tier.price > tier.listPrice) errors.push(`${where}: el precio no puede ser mayor que el de lista`)
      if (tier.courses.length > 200) errors.push(`${where}: máximo 200 cursos`)
      tier.courses.forEach((course, i) => {
        if (!course.title.trim()) errors.push(`${where} · curso ${i + 1}: falta el título`)
        if (course.title.length > 200) errors.push(`${where} · curso ${i + 1}: título demasiado largo`)
        if (course.minutes !== null && (!Number.isInteger(course.minutes) || course.minutes < 0 || course.minutes > 1440)) {
          errors.push(`${where} · curso ${i + 1}: duración inválida`)
        }
      })
    }
  }
  for (const t of TIER_KEYS) {
    const b = doc.bundles[t]
    if (!Number.isInteger(b.price) || b.price < 0) errors.push(`Catálogo completo · ${TIER_LABEL[t]}: precio inválido`)
  }
  for (const k of UPGRADE_KEYS) {
    if (!Number.isInteger(doc.upgrades[k].price) || doc.upgrades[k].price < 0) errors.push(`${UPGRADE_PRICES[k].label}: precio inválido`)
  }
  return [...new Set(errors)]
}

// ── componente principal ──

export default function CatalogEditor({
  initialDoc,
  initialVersionId,
  versions,
}: {
  initialDoc: CatalogDoc
  initialVersionId: number | null
  versions: CatalogVersionInfo[]
}) {
  const router = useRouter()
  const [doc, setDoc] = useState<CatalogDoc>(initialDoc)
  const [dirty, setDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(initialDoc.categories[0]?.id ?? 'bundle')
  const [note, setNote] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null)
  const [publishMessage, setPublishMessage] = useState<string | null>(null)
  const [loadingVersionId, setLoadingVersionId] = useState<number | null>(null)

  // Cuando el servidor manda una nueva versión (publicar o restaurar hicieron router.refresh()),
  // sincronizamos el editor con los datos ya guardados. Patrón recomendado por React para
  // "ajustar estado cuando cambia una prop" (evita el efecto con setState en cascada).
  const [syncedVersionId, setSyncedVersionId] = useState(initialVersionId)
  if (syncedVersionId !== initialVersionId) {
    setSyncedVersionId(initialVersionId)
    setDoc(initialDoc)
    setDirty(false)
  }

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const mutate = useCallback((fn: (d: CatalogDoc) => CatalogDoc) => {
    setDoc(prev => fn(prev))
    setDirty(true)
  }, [])

  const derived = useMemo<DerivedCatalog>(() => deriveCatalog(doc, { withDrive: false }), [doc])

  async function handlePublish() {
    const clientErrors = validateClient(doc)
    if (clientErrors.length) {
      setPublishErrors(clientErrors)
      setPublishMessage(null)
      return
    }
    setPublishing(true)
    setPublishErrors(null)
    setPublishMessage(null)
    try {
      const res = await fetch('/admin/catalogo/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', doc, note: note.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPublishErrors(data.errors ?? [data.error ?? 'No se pudo publicar.'])
        return
      }
      setDirty(false)
      setNote('')
      setPublishMessage(`Publicado (versión ${data.versionId}) — la web se actualiza en segundos.`)
      router.refresh()
    } catch {
      setPublishErrors(['No se pudo conectar con el servidor.'])
    } finally {
      setPublishing(false)
    }
  }

  function handleDiscard() {
    if (!dirty) return
    if (confirm('¿Descartar los cambios sin publicar?')) {
      setDoc(initialDoc)
      setDirty(false)
      setPublishErrors(null)
      setPublishMessage(null)
    }
  }

  async function handleLoadVersion(id: number) {
    setLoadingVersionId(id)
    try {
      const res = await fetch(`/admin/catalogo/api?version=${id}`)
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'No se pudo cargar la versión.')
        return
      }
      setDoc(data.doc)
      setDirty(true)
      setPublishErrors(null)
      setPublishMessage(`Versión ${id} cargada en el editor. Revisá los cambios y publicá para aplicarlos.`)
    } catch {
      alert('No se pudo conectar con el servidor.')
    } finally {
      setLoadingVersionId(null)
    }
  }

  async function handleRestore(id: number) {
    if (!confirm(`¿Restaurar la versión ${id}? Esto la publica de inmediato.`)) return
    setPublishing(true)
    try {
      const res = await fetch('/admin/catalogo/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', versionId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'No se pudo restaurar.')
        return
      }
      setPublishMessage(`Restaurada la versión ${id} (nueva versión ${data.versionId}).`)
      router.refresh()
    } catch {
      alert('No se pudo conectar con el servidor.')
    } finally {
      setPublishing(false)
    }
  }

  const activeCategory = doc.categories.find(c => c.id === activeTab)

  return (
    <div>
      {publishMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl p-4">{publishMessage}</div>
      )}
      {publishErrors && publishErrors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4">
          <p className="font-semibold mb-1">No se pudo publicar:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {publishErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {doc.categories.map(c => (
          <TabButton key={c.id} active={activeTab === c.id} onClick={() => setActiveTab(c.id)}>
            {c.name || c.id}
          </TabButton>
        ))}
        <TabButton active={activeTab === 'bundle'} onClick={() => setActiveTab('bundle')}>
          Catálogo completo y upgrades
        </TabButton>
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
          Historial
        </TabButton>
      </div>

      {activeTab === 'bundle' ? (
        <BundleTab doc={doc} derived={derived} onChange={mutate} />
      ) : activeTab === 'history' ? (
        <HistoryTab
          initialVersionId={initialVersionId}
          versions={versions}
          onLoadVersion={handleLoadVersion}
          onRestore={handleRestore}
          loadingId={loadingVersionId}
        />
      ) : activeCategory ? (
        <CategoryTab
          category={activeCategory}
          derived={derived}
          onChangeCategory={fn =>
            mutate(d => ({ ...d, categories: d.categories.map(c => (c.id === activeCategory.id ? fn(c) : c)) }))
          }
        />
      ) : null}

      <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-4 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex flex-wrap items-center gap-3 justify-between">
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${dirty ? 'text-amber-700' : 'text-gray-400'}`}>
          <span className={`w-2 h-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-gray-300'}`} />
          {dirty ? 'Hay cambios sin publicar' : 'Sin cambios pendientes'}
        </span>
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Nota del cambio
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={200}
              placeholder="opcional"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!dirty || publishing}
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Descartar cambios
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {publishing ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── UI genérica ──

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
        active ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
      }`}
    >
      {children}
    </button>
  )
}

function OverrideRow({
  label,
  auto,
  unit,
  value,
  onToggle,
  onChange,
}: {
  label: string
  auto: number
  unit: (n: number) => string
  value: number | null
  onToggle: (checked: boolean) => void
  onChange: (n: number) => void
}) {
  const manual = value !== null
  const mismatch = manual && value !== auto
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={manual}
            onChange={e => onToggle(e.target.checked)}
            className="rounded border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          />
          Cargar a mano
        </label>
      </div>
      {manual ? (
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={e => {
            const n = Math.trunc(Number(e.target.value))
            onChange(Number.isFinite(n) ? Math.max(0, n) : value)
          }}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      ) : (
        <p className="mt-2 text-sm text-gray-700">Automático: {unit(auto)}</p>
      )}
      {mismatch && (
        <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          ⚠ El valor cargado a mano ({unit(value)}) no coincide con el conteo automático ({unit(auto)}). Puede pasar
          si los cursos de la lista no cubren todo lo que tiene el nivel.
        </p>
      )}
    </div>
  )
}

function CourseRow({
  course,
  index,
  total,
  onChangeTitle,
  onChangeMinutes,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  course: CatalogCourse
  index: number
  total: number
  onChangeTitle: (title: string) => void
  onChangeMinutes: (minutes: number | null) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="sr-only" htmlFor={`title-${course.id}`}>
          Título del curso {index + 1}
        </label>
        <input
          id={`title-${course.id}`}
          type="text"
          value={course.title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Título del curso"
          maxLength={200}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="w-20">
        <label className="sr-only" htmlFor={`min-${course.id}`}>
          Minutos del curso {index + 1}
        </label>
        <input
          id={`min-${course.id}`}
          type="text"
          inputMode="numeric"
          value={course.minutes ?? ''}
          placeholder="min"
          onChange={e => {
            const raw = e.target.value.trim()
            if (raw === '') {
              onChangeMinutes(null)
              return
            }
            const n = Math.trunc(Number(raw))
            if (Number.isFinite(n)) onChangeMinutes(clamp(n, 0, 1440))
          }}
          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={index === 0}
        aria-label={`Subir curso ${index + 1}`}
        className="px-2 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={index === total - 1}
        aria-label={`Bajar curso ${index + 1}`}
        className="px-2 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Eliminar curso ${index + 1}`}
        className="px-2 py-1 text-red-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
      >
        ✕
      </button>
    </div>
  )
}

// ── especialización ──

function CategoryTab({
  category,
  derived,
  onChangeCategory,
}: {
  category: CatalogCategory
  derived: DerivedCatalog
  onChangeCategory: (fn: (c: CatalogCategory) => CatalogCategory) => void
}) {
  const dc = derived.categories.find(c => c.id === category.id)

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 grid sm:grid-cols-[96px_1fr_2fr] gap-4">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Ícono</span>
          <input
            type="text"
            value={category.icon}
            maxLength={8}
            onChange={e => onChangeCategory(c => ({ ...c, icon: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Nombre</span>
          <input
            type="text"
            value={category.name}
            maxLength={60}
            onChange={e => onChangeCategory(c => ({ ...c, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Descripción</span>
          <input
            type="text"
            value={category.description}
            maxLength={200}
            onChange={e => onChangeCategory(c => ({ ...c, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
      </div>

      {dc && <PreviewPanel dc={dc} />}

      <div className="grid md:grid-cols-3 gap-4">
        {TIER_KEYS.map(t => (
          <TierCard
            key={t}
            tierKey={t}
            label={TIER_LABEL[t]}
            tier={category.tiers[t]}
            derivedTier={dc?.tiers[t]}
            category={category}
            onChange={fn => onChangeCategory(c => ({ ...c, tiers: { ...c.tiers, [t]: fn(c.tiers[t]) } }))}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewPanel({ dc }: { dc: DerivedCatalog['categories'][number] }) {
  return (
    <div className="bg-gray-900 text-white rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest text-purple-300 mb-3">Vista previa — cómo se va a ver en la web</p>
      <div className="grid grid-cols-3 gap-3">
        {TIER_KEYS.map(t => {
          const tier = dc.tiers[t]
          return (
            <div key={t} className="bg-white/5 rounded-xl p-3">
              <p className="text-sm font-bold">{tier.label}</p>
              <p className="text-lg font-extrabold text-purple-300">${tier.price}</p>
              <p className="text-xs text-gray-400 line-through">${tier.listPrice}</p>
              <p className="text-xs text-green-400">{tier.savings}% off</p>
              <p className="text-xs text-gray-300 mt-1">
                {tier.courses} cursos · {minutesToLabel(tier.minutes)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TierCard({
  tierKey,
  label,
  tier,
  derivedTier,
  category,
  onChange,
}: {
  tierKey: TierKey
  label: string
  tier: CatalogTier
  derivedTier: { price: number; listPrice: number; courses: number; minutes: number; savings: number } | undefined
  category: CatalogCategory
  onChange: (fn: (t: CatalogTier) => CatalogTier) => void
}) {
  const discount = tier.listPrice > 0 ? Math.round(((tier.listPrice - tier.price) / tier.listPrice) * 100) : 0
  const priceError = tier.price > tier.listPrice
  const auto = cumulativeCourses(category.tiers, tierKey)
  const autoCourses = auto.length
  const autoMinutes = sumMinutes(auto)
  const includeNote =
    tierKey === 'pro' ? 'Pro incluye los cursos de Starter.' : tierKey === 'expert' ? 'Expert incluye los cursos de Starter + Pro.' : null

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-4">
      <h3 className="font-extrabold text-gray-900">{label}</h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Precio de lista (USD)</span>
          <input
            type="number"
            inputMode="numeric"
            value={tier.listPrice}
            onChange={e => {
              const n = parseIntOr(e.target.value, tier.listPrice)
              onChange(t => ({ ...t, listPrice: clamp(n, 0, 100000) }))
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Descuento %</span>
          <input
            type="number"
            inputMode="numeric"
            value={discount}
            onChange={e => {
              const d = clamp(parseIntOr(e.target.value, discount), 0, 100)
              onChange(t => ({ ...t, price: Math.round((t.listPrice * (100 - d)) / 100) }))
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-semibold text-gray-500 mb-1">Precio final (USD)</span>
        <input
          type="number"
          inputMode="numeric"
          value={tier.price}
          onChange={e => {
            const n = parseIntOr(e.target.value, tier.price)
            onChange(t => ({ ...t, price: clamp(n, 0, 100000) }))
          }}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            priceError ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </label>
      {priceError && <p className="text-xs text-red-600 -mt-2">El precio final no puede ser mayor que el de lista.</p>}

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Cursos de este nivel</span>
          <button
            type="button"
            onClick={() => onChange(t => ({ ...t, courses: [...t.courses, { id: crypto.randomUUID(), title: '', minutes: null }] }))}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
          >
            + Agregar curso
          </button>
        </div>
        {includeNote && <p className="text-xs text-gray-400 mb-2">{includeNote}</p>}
        <div className="space-y-2">
          {tier.courses.map((c, i) => (
            <CourseRow
              key={c.id}
              course={c}
              index={i}
              total={tier.courses.length}
              onChangeTitle={title => onChange(t => ({ ...t, courses: t.courses.map((cc, ci) => (ci === i ? { ...cc, title } : cc)) }))}
              onChangeMinutes={minutes => onChange(t => ({ ...t, courses: t.courses.map((cc, ci) => (ci === i ? { ...cc, minutes } : cc)) }))}
              onMoveUp={() => onChange(t => ({ ...t, courses: swap(t.courses, i, i - 1) }))}
              onMoveDown={() => onChange(t => ({ ...t, courses: swap(t.courses, i, i + 1) }))}
              onDelete={() => {
                if (confirm(`¿Eliminar el curso "${c.title || 'sin título'}"?`)) {
                  onChange(t => ({ ...t, courses: t.courses.filter((_, ci) => ci !== i) }))
                }
              }}
            />
          ))}
          {tier.courses.length === 0 && <p className="text-xs text-gray-400 italic">Todavía no hay cursos cargados en este nivel.</p>}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-3">
        {derivedTier && (
          <p className="text-sm text-gray-700">
            Cantidad mostrada: <strong>{derivedTier.courses} cursos</strong> · duración{' '}
            <strong>{minutesToLabel(derivedTier.minutes)}</strong>
          </p>
        )}
        <OverrideRow
          label="Cantidad de cursos a mostrar"
          auto={autoCourses}
          unit={n => `${n} cursos`}
          value={tier.coursesOverride}
          onToggle={checked => onChange(t => ({ ...t, coursesOverride: checked ? autoCourses : null }))}
          onChange={n => onChange(t => ({ ...t, coursesOverride: n }))}
        />
        <OverrideRow
          label="Duración a mostrar"
          auto={autoMinutes}
          unit={n => minutesToLabel(n)}
          value={tier.minutesOverride}
          onToggle={checked => onChange(t => ({ ...t, minutesOverride: checked ? autoMinutes : null }))}
          onChange={n => onChange(t => ({ ...t, minutesOverride: n }))}
        />
      </div>
    </div>
  )
}

// ── catálogo completo y upgrades ──

function BundleTab({
  doc,
  derived,
  onChange,
}: {
  doc: CatalogDoc
  derived: DerivedCatalog
  onChange: (fn: (d: CatalogDoc) => CatalogDoc) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {TIER_KEYS.map(t => (
          <BundleCard
            key={t}
            tierKey={t}
            label={TIER_LABEL[t]}
            bundle={doc.bundles[t]}
            derivedBundle={derived.bundles[t]}
            doc={doc}
            onChange={fn => onChange(d => ({ ...d, bundles: { ...d.bundles, [t]: fn(d.bundles[t]) } }))}
          />
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h3 className="font-extrabold text-gray-900 mb-3">Upgrades</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {UPGRADE_KEYS.map(k => (
            <label key={k} className="block">
              <span className="block text-xs font-semibold text-gray-500 mb-1">{UPGRADE_PRICES[k].label}</span>
              <input
                type="number"
                inputMode="numeric"
                value={doc.upgrades[k].price}
                onChange={e => {
                  const n = parseIntOr(e.target.value, doc.upgrades[k].price)
                  onChange(d => ({ ...d, upgrades: { ...d.upgrades, [k]: { price: clamp(n, 0, 100000) } } }))
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h3 className="font-extrabold text-gray-900 mb-3">Cursos únicos (hero de la landing)</h3>
        <OverrideRow
          label="Cursos únicos totales"
          auto={autoUniqueCourses(doc)}
          unit={n => `${n} cursos`}
          value={doc.uniqueCoursesOverride}
          onToggle={checked => onChange(d => ({ ...d, uniqueCoursesOverride: checked ? autoUniqueCourses(d) : null }))}
          onChange={n => onChange(d => ({ ...d, uniqueCoursesOverride: n }))}
        />
      </div>
    </div>
  )
}

function BundleCard({
  tierKey,
  label,
  bundle,
  derivedBundle,
  doc,
  onChange,
}: {
  tierKey: TierKey
  label: string
  bundle: CatalogBundle
  derivedBundle: { price: number; listPrice: number; courses: number; minutes: number }
  doc: CatalogDoc
  onChange: (fn: (b: CatalogBundle) => CatalogBundle) => void
}) {
  const autoListPrice = doc.categories.reduce((s, c) => s + c.tiers[tierKey].listPrice, 0)
  const autoUnique = uniqueCourses(doc.categories.flatMap(c => cumulativeCourses(c.tiers, tierKey)))
  const autoCourses = autoUnique.length
  const autoMinutes = sumMinutes(autoUnique)
  const discount = derivedBundle.listPrice > 0 ? Math.round(((derivedBundle.listPrice - bundle.price) / derivedBundle.listPrice) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <h3 className="font-extrabold text-gray-900">{label}</h3>
      <label className="block">
        <span className="block text-xs font-semibold text-gray-500 mb-1">Precio (USD)</span>
        <input
          type="number"
          inputMode="numeric"
          value={bundle.price}
          onChange={e => {
            const n = parseIntOr(e.target.value, bundle.price)
            onChange(b => ({ ...b, price: clamp(n, 0, 100000) }))
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </label>
      <label className="block">
        <span className="block text-xs font-semibold text-gray-500 mb-1">Descuento % (sobre el precio de lista mostrado)</span>
        <input
          type="number"
          inputMode="numeric"
          value={discount}
          onChange={e => {
            const d = clamp(parseIntOr(e.target.value, discount), 0, 100)
            onChange(b => ({ ...b, price: Math.round((derivedBundle.listPrice * (100 - d)) / 100) }))
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </label>
      <OverrideRow
        label="Precio de lista mostrado"
        auto={autoListPrice}
        unit={n => `$${n}`}
        value={bundle.listPriceOverride}
        onToggle={checked => onChange(b => ({ ...b, listPriceOverride: checked ? autoListPrice : null }))}
        onChange={n => onChange(b => ({ ...b, listPriceOverride: n }))}
      />
      <OverrideRow
        label="Cantidad de cursos"
        auto={autoCourses}
        unit={n => `${n} cursos`}
        value={bundle.coursesOverride}
        onToggle={checked => onChange(b => ({ ...b, coursesOverride: checked ? autoCourses : null }))}
        onChange={n => onChange(b => ({ ...b, coursesOverride: n }))}
      />
      <OverrideRow
        label="Duración"
        auto={autoMinutes}
        unit={n => minutesToLabel(n)}
        value={bundle.minutesOverride}
        onToggle={checked => onChange(b => ({ ...b, minutesOverride: checked ? autoMinutes : null }))}
        onChange={n => onChange(b => ({ ...b, minutesOverride: n }))}
      />
      <p className="text-sm text-gray-700 border-t border-gray-100 pt-2">
        Mostrado: <strong>${derivedBundle.price}</strong> de <strong>${derivedBundle.listPrice}</strong> · {derivedBundle.courses} cursos ·{' '}
        {minutesToLabel(derivedBundle.minutes)}
      </p>
    </div>
  )
}

// ── historial ──

function HistoryTab({
  initialVersionId,
  versions,
  onLoadVersion,
  onRestore,
  loadingId,
}: {
  initialVersionId: number | null
  versions: CatalogVersionInfo[]
  onLoadVersion: (id: number) => void
  onRestore: (id: number) => void
  loadingId: number | null
}) {
  return (
    <div className="space-y-4">
      {initialVersionId === null && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4">
          Todavía no hay versiones guardadas: se están mostrando los datos iniciales (v9). Publicá una vez para guardarlos.
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
        {versions.length === 0 && <p className="p-5 text-sm text-gray-400">Todavía no hay versiones publicadas.</p>}
        {versions.map(v => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-bold text-gray-900">Versión {v.id}</p>
              <p className="text-sm text-gray-400">
                {new Date(v.created_at).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {v.note && <p className="text-sm text-gray-600 mt-1">{v.note}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loadingId === v.id}
                onClick={() => onLoadVersion(v.id)}
                className="bg-white border border-gray-200 hover:border-purple-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loadingId === v.id ? 'Cargando…' : 'Cargar en el editor'}
              </button>
              <button
                type="button"
                onClick={() => onRestore(v.id)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-lg"
              >
                Restaurar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
