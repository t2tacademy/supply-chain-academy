const PROFILES = [
  {
    code: 'PERFIL-01',
    title: 'Estudiante universitario',
    desc: 'Querés entrar al mundo Supply Chain con una ventaja real sobre el resto de los egresados.',
    icon: (
      <path d="M2 9l10-5 10 5-10 5-10-5z M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" />
    ),
  },
  {
    code: 'PERFIL-02',
    title: 'Profesional en transición',
    desc: 'Venís de otra área y necesitás formación práctica y rápida para arrancar en tu nuevo rol.',
    icon: <path d="M4 4v6h6M20 20v-6h-6M5 15a8 8 0 0014-4M19 9a8 8 0 00-14 4" />,
  },
  {
    code: 'PERFIL-03',
    title: 'Analista que quiere crecer',
    desc: 'Ya estás en el rubro pero querés profundizar, especializarte y dar el siguiente paso.',
    icon: <path d="M4 20V10M11 20V4M18 20v-7M3 20h18" />,
  },
  {
    code: 'PERFIL-04',
    title: 'Líder de operaciones',
    desc: 'Necesitás actualizar a tu equipo o reforzar conceptos clave con contenido aplicado a la realidad.',
    icon: <path d="M12 2l3 6 6 1-4.5 4.5L17.5 21 12 17.5 6.5 21l1-7.5L3 9l6-1z" />,
  },
]

export default function ForWhom() {
  return (
    <section className="relative border-y border-white/[.07] px-5 py-16 sm:px-8 md:px-14 md:py-24" style={{ background: 'var(--tc-bg-2)' }}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-9 flex items-center justify-between gap-4 border-t border-white/[.12] pt-3.5 font-mono text-[11px] font-medium tracking-[.14em] text-tc-text-2">
          <span>
            <span className="text-tc-violet-2">§03</span> — MATRIZ DE PERFILES
          </span>
          <span>4 SEGMENTOS</span>
        </div>
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <h2 className="m-0 font-display font-bold leading-[.95] tracking-[-.04em]" style={{ fontSize: 'clamp(36px,5vw,64px)' }}>
            ¿Para quién es este catálogo?
          </h2>
          <p className="m-0 max-w-[560px] text-[16px] leading-[1.55] text-tc-text-2">
            Si te identificás con alguno de estos perfiles, este catálogo es para vos.
          </p>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))' }}>
          {PROFILES.map((p) => (
            <div
              key={p.code}
              className="flex flex-col gap-4 border border-white/10 p-5 transition-colors hover:border-tc-violet-2/50"
              style={{ background: 'rgba(22,24,28,.7)' }}
            >
              <div className="flex items-center justify-between font-mono text-[10.5px] font-medium tracking-[.1em] text-tc-text-2">
                <span className="text-tc-violet-2">{p.code}</span>
              </div>
              <span className="grid h-11 w-11 place-items-center border-[1.5px] border-tc-violet-2 text-tc-violet-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  {p.icon}
                </svg>
              </span>
              <h3 className="m-0 font-display text-lg font-semibold leading-tight tracking-[-.01em] text-tc-text">
                {p.title}
              </h3>
              <p className="m-0 text-sm leading-[1.55] text-tc-text-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
