export default function Footer({ extraBottomPadding = false }: { extraBottomPadding?: boolean }) {
  return (
    <footer
      className="relative z-[2] border-t border-white/[.07] px-5 pt-7 sm:px-8 md:px-14"
      style={{ paddingBottom: extraBottomPadding ? 96 : 28 }}
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 font-mono text-xs font-medium tracking-[.06em] text-tc-text-2">
        <span>T2T Academy · Catálogo Supply Chain</span>
        <span>
          ¿Consultas?{' '}
          <a href="mailto:t2tscacademy@gmail.com" className="text-tc-violet-2 hover:text-tc-text">
            t2tscacademy@gmail.com
          </a>
        </span>
        <a
          href="https://t2tacademy.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tc-violet-2 hover:text-tc-text"
        >
          Habilidades Blandas ↗
        </a>
      </div>
    </footer>
  )
}
