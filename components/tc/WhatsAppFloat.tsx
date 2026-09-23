const WA_HREF = `https://wa.me/5491134030955?text=${encodeURIComponent(
  '¡Hola Gustavo! 👋 Estuve viendo el Catálogo Supply Chain y me parece una oportunidad increíble. Me gustaría saber más sobre los módulos y cómo empezar. ¡Muchas gracias!'
)}`

export default function WhatsAppFloat({ raised = false }: { raised?: boolean }) {
  return (
    <a
      href={WA_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-3.5 z-[65] grid h-14 w-14 place-items-center bg-tc-green text-tc-bg transition-[bottom] duration-300 hover:bg-[#86EFAC] sm:right-7"
      style={{
        bottom: raised ? 84 : 20,
        boxShadow: '0 0 0 1px rgba(74,222,128,.6),0 0 30px rgba(74,222,128,.45)',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M4 20l1.4-4.2A8 8 0 1 1 8.6 19z" />
        <path d="M9 10c0 2.5 2.5 5 5 5" />
      </svg>
    </a>
  )
}
