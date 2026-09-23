import Link from 'next/link'
import { ORDER_NUMBER_RE } from '@/lib/orderNumber'

export const metadata = {
  title: '¡Pedido recibido! — T2T Academy',
  description: 'Tu pedido fue registrado. Gustavo va a revisar tu pago y en menos de 24hs te enviamos el acceso.',
}

const STEPS = [
  { code: '01', text: 'Orden registrada en nuestro sistema' },
  { code: '02', text: 'Gustavo revisa tu comprobante de pago' },
  { code: '03', text: 'Te enviamos el link de Google Drive por email' },
  { code: '04', text: '¡Empezás a aprender!' },
]

export default async function GraciasPage({ searchParams }: { searchParams: Promise<{ orden?: string | string[] }> }) {
  const { orden } = await searchParams
  const orderNumber = typeof orden === 'string' && ORDER_NUMBER_RE.test(orden) ? orden : null

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16"
      style={{ background: 'var(--tc-bg)', color: 'var(--tc-text)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-lg border border-white/10" style={{ background: 'var(--tc-surface)' }}>
        <div
          aria-hidden="true"
          className="h-3"
          style={{ background: 'repeating-linear-gradient(-45deg,#4ADE80 0 10px,#0B0D12 10px 20px)' }}
        />
        <div className="p-8 sm:p-10">
          <div className="mb-6 flex items-center justify-between font-mono text-[11px] font-medium tracking-[.14em] text-tc-text-2">
            <span className="text-tc-green">● DESPACHO CONFIRMADO</span>
            <span>{orderNumber ? `ORDEN ${orderNumber}` : 'ORDEN REGISTRADA'}</span>
          </div>

          <h1
            className="m-0 mb-3 font-display font-bold leading-[.95] tracking-[-.03em]"
            style={{ fontSize: 'clamp(30px,5vw,44px)' }}
          >
            ¡Pedido recibido!
          </h1>
          <p className="m-0 mb-8 text-[15px] leading-[1.6] text-tc-text-2">
            Tu orden fue registrada con éxito. Gustavo va a revisar tu comprobante y en{' '}
            <strong className="text-tc-text">menos de 24 hs hábiles</strong> te enviamos el acceso a tus cursos por
            email.
          </p>
          {orderNumber && (
            <p className="m-0 -mt-4 mb-8 text-sm leading-[1.6] text-tc-text-2">
              Tu número de orden es <strong className="font-mono text-tc-text">{orderNumber}</strong>. Te enviamos un correo con el
              detalle de la operación; revisá también la carpeta de spam.
            </p>
          )}

          <div className="mb-8 flex flex-col gap-2.5">
            {STEPS.map((step) => (
              <div key={step.code} className="flex items-center gap-3 border border-white/10 px-4 py-3" style={{ background: 'rgba(255,255,255,.03)' }}>
                <span className="font-mono text-xs font-bold text-tc-violet-2">{step.code}</span>
                <span className="text-sm font-medium text-tc-text">{step.text}</span>
              </div>
            ))}
          </div>

          <div
            className="mb-8 flex flex-col gap-1.5 border border-tc-violet/40 p-4 text-sm"
            style={{ background: 'rgba(168,85,247,.08)', color: 'var(--tc-text-2)' }}
          >
            <p className="m-0">Recibirás un email con el link a tu carpeta de Google Drive.</p>
            <p className="m-0">
              Tenés <strong className="text-tc-text">3 meses para descargar</strong> los videos desde la activación.
            </p>
            <p className="m-0">
              ¿Dudas? Escribinos a <strong className="text-tc-text">t2tscacademy@gmail.com</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/5491134030955?text=${encodeURIComponent('¡Hola Gustavo! Acabo de hacer mi pedido en el Catálogo Supply Chain. Quería confirmar que lo recibiste correctamente. ¡Muchas gracias!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 bg-tc-green px-5 py-3 font-display font-bold text-tc-bg transition-colors hover:bg-[#86EFAC]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center border border-white/15 px-5 py-3 font-display font-bold text-tc-text transition-colors hover:border-tc-violet-2"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>

      <p className="relative mt-8 font-mono text-xs tracking-[.06em] text-tc-text-2">
        T2T Academy · t2tscacademy@gmail.com
      </p>
    </div>
  )
}
