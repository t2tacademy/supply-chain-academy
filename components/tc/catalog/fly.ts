// Ports the design's fly() animation: a small chip flies from the clicked
// source element to the #remito panel, then a pulse event is dispatched so
// the Remito can flash its border.

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function flyToRemito(source: Element | null, label: string): void {
  const dispatchPulse = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tc:remito-pulse'))
    }
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const target = document.getElementById('remito')
  const src = source?.getBoundingClientRect()
  const tg = target?.getBoundingClientRect()

  if (prefersReducedMotion() || !src || !tg || !tg.width) {
    dispatchPulse()
    return
  }

  const el = document.createElement('div')
  el.textContent = label
  el.setAttribute('aria-hidden', 'true')

  const sx = src.left + src.width / 2
  const sy = src.top + src.height / 2

  Object.assign(el.style, {
    position: 'fixed',
    left: `${sx}px`,
    top: `${sy}px`,
    zIndex: '9999',
    font: "700 12px 'JetBrains Mono', monospace",
    letterSpacing: '.08em',
    color: '#07080B',
    background: '#C084FC',
    padding: '9px 12px',
    boxShadow: '0 0 28px rgba(168,85,247,.7)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%,-50%)',
  } as CSSStyleDeclaration)

  document.body.appendChild(el)

  const dx = tg.left + Math.min(tg.width / 2, 180) - sx
  const dy = tg.top + 40 - sy

  const animation = el.animate(
    [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      {
        transform: `translate(calc(-50% + ${dx * 0.45}px),calc(-50% + ${dy * 0.45 - 70}px)) rotate(-6deg) scale(1.05)`,
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.45)`,
        opacity: 0.2,
      },
    ],
    { duration: 680, easing: 'cubic-bezier(.55,0,.25,1)' }
  )

  animation.onfinish = () => {
    el.remove()
    dispatchPulse()
  }
}
