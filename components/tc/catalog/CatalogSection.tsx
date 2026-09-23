import type { ReactNode } from 'react'

interface CatalogSectionProps {
  children: ReactNode
  remito: ReactNode
}

export default function CatalogSection({ children, remito }: CatalogSectionProps) {
  return (
    <section
      id="catalogo"
      className="relative"
      style={{
        padding: 'clamp(88px,11vw,156px) clamp(20px,4vw,56px) clamp(72px,9vw,120px)',
        backgroundColor: '#E6E9EE',
        color: '#0B0D12',
        backgroundImage:
          'linear-gradient(rgba(11,13,18,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(11,13,18,.05) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0"
        style={{
          height: 22,
          background: '#E6E9EE',
          borderBottom: '1px solid rgba(11,13,18,.25)',
          backgroundImage:
            'repeating-linear-gradient(90deg,rgba(11,13,18,.4) 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,#0B0D12 0 1.5px,transparent 1.5px 80px)',
          backgroundSize: '100% 8px,100% 22px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0 100%,0 0',
        }}
      />

      <div className="mx-auto" style={{ maxWidth: 1320 }}>
        <div
          className="flex justify-between gap-4 font-mono text-[11px]"
          style={{
            marginBottom: 'clamp(36px,5vw,64px)',
            letterSpacing: '.14em',
            color: '#4A4F5C',
            borderTop: '1px solid rgba(11,13,18,.2)',
            paddingTop: 14,
          }}
        >
          <span><span style={{ color: '#7E22CE' }}>§05</span> — ARMÁ TU PEDIDO</span>
          <span>7 ESPECIALIZACIONES · 59 SKU</span>
        </div>

        <div className="flex flex-col gap-4.5" style={{ marginBottom: 'clamp(40px,6vw,72px)' }}>
          <h2
            className="m-0 font-display"
            style={{ fontWeight: 700, fontSize: 'clamp(44px,7vw,112px)', lineHeight: 0.88, letterSpacing: '-.05em', textWrap: 'balance' }}
          >
            Especializaciones disponibles
          </h2>
          <p className="m-0" style={{ maxWidth: 560, fontSize: 17, lineHeight: 1.55, color: '#4A4F5C' }}>
            Dos formas de armar tu catálogo. Podés elegir un nivel completo o personalizar especialización por especialización.
          </p>
        </div>

        <div
          className="grid items-start gap-7 md:grid-cols-[minmax(0,1fr)_minmax(320px,370px)]"
          style={{ gap: 'clamp(28px,3vw,44px)' }}
        >
          <div className="flex min-w-0 flex-col" style={{ gap: 'clamp(48px,6vw,80px)' }}>
            {children}
          </div>
          {remito}
        </div>
      </div>
    </section>
  )
}

interface OptionHeaderProps {
  n: 1 | 2
  title: string
  text: string
}

export function OptionHeader({ n, title, text }: OptionHeaderProps) {
  const accent = n === 1 ? '#7E22CE' : '#C084FC'
  const muted = n === 1 ? '#4A4F5C' : '#9AA1B1'
  return (
    <div className="flex flex-col gap-2.5" style={{ maxWidth: 560 }}>
      <span className="font-mono text-[11px]" style={{ letterSpacing: '.14em', color: accent }}>OPCIÓN {n}</span>
      <h3 className="m-0 font-display" style={{ fontWeight: 700, fontSize: 'clamp(28px,3vw,40px)', lineHeight: 1, letterSpacing: '-.03em' }}>
        {title}
      </h3>
      <p className="m-0" style={{ fontSize: 16, lineHeight: 1.5, color: muted }}>{text}</p>
    </div>
  )
}

export function CatalogNote() {
  return (
    <p className="m-0 font-mono text-[12.5px]" style={{ lineHeight: 1.6, color: '#9AA1B1', maxWidth: 760 }}>
      ~50% de descuento vs precio de lista. Pro incluye todos los cursos Starter + los propios. Expert incluye todos los niveles. Acceso por 3 meses para descargar desde Google Drive.
    </p>
  )
}
