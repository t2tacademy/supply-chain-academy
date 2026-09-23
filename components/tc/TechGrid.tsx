export default function TechGrid() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        className="absolute top-0 bottom-0 left-0 z-[1] w-3.5 border-r border-white/[.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg,rgba(255,255,255,.18) 0 1px,transparent 1px 16px),repeating-linear-gradient(180deg,rgba(255,255,255,.35) 0 1px,transparent 1px 64px)',
          backgroundSize: '6px 100%,14px 100%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 z-[1] w-3.5 border-l border-white/[.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg,rgba(255,255,255,.18) 0 1px,transparent 1px 16px),repeating-linear-gradient(180deg,rgba(255,255,255,.35) 0 1px,transparent 1px 64px)',
          backgroundSize: '6px 100%,14px 100%',
          backgroundPosition: 'right top,right top',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  )
}
