const WA_HREF = `https://wa.me/5491134030955?text=${encodeURIComponent(
  '¡Hola Gustavo! 👋 Estuve viendo el Catálogo Supply Chain y me parece una oportunidad increíble. Me gustaría saber más sobre los módulos y cómo empezar. ¡Muchas gracias!'
)}`

export default function Closing() {
  return (
    <section
      className="relative overflow-hidden pb-16 md:pb-24"
      style={{
        backgroundColor: '#D9DBD6',
        color: '#0B0D12',
        backgroundImage:
          'linear-gradient(rgba(11,13,18,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(11,13,18,.05) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    >
      <div
        aria-hidden="true"
        className="h-3"
        style={{ background: 'radial-gradient(circle at 10px 0,#07080B 7px,transparent 7.5px) 0 0/20px 12px repeat-x' }}
      />
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 pt-16 sm:px-8 md:px-14 md:pt-24">
        <span className="font-mono text-[11px] font-medium tracking-[.14em]" style={{ color: '#4A4F5C' }}>
          <span style={{ color: '#7E22CE' }}>§06</span> — ÚLTIMO LLAMADO A DESPACHO
        </span>
        <h2
          className="m-0 font-display font-bold leading-[.86] tracking-[-.055em]"
          style={{ fontSize: 'clamp(52px,10vw,168px)', textWrap: 'balance' }}
        >
          Tu supply chain también <span style={{ color: '#7E22CE' }}>se entrena.</span>
        </h2>
        <p className="m-0 max-w-[560px]" style={{ fontSize: 'clamp(17px,1.6vw,20px)', lineHeight: 1.55, color: '#3F444F' }}>
          ¿Cuánto tiempo más vas a operar con quiebre de conocimiento? Stock disponible, lead time de 24 hs. Despachá
          tu carrera hoy.
        </p>
        <div className="flex flex-wrap gap-3.5">
          <a
            href="#catalogo"
            className="flex h-[58px] items-center gap-3 bg-tc-violet px-7 font-display text-base font-bold text-tc-bg transition-colors hover:bg-tc-violet-2"
            style={{ boxShadow: '0 0 0 1px #C084FC,0 0 40px rgba(168,85,247,.45)' }}
          >
            Armar mi pedido
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="tc-wa-outline flex h-[58px] items-center gap-2.5 border-[1.5px] px-5 font-display text-[15px] font-semibold transition-colors"
            style={{ borderColor: '#166534', color: '#166534' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M4 20l1.4-4.2A8 8 0 1 1 8.6 19z" />
              <path d="M9 10c0 2.5 2.5 5 5 5" />
            </svg>
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
