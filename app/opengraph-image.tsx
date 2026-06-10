import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Catálogo Supply Chain — T2T Academy'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #050E1A 0%, #0B1829 45%, #0F1E40 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Badge */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.3)',
          border: '1px solid rgba(124, 58, 237, 0.5)',
          color: '#c4b5fd',
          fontSize: 20,
          fontWeight: 600,
          padding: '8px 24px',
          borderRadius: 999,
          marginBottom: 28,
          letterSpacing: 2,
        }}>
          T2T ACADEMY · SUPPLY CHAIN
        </div>

        {/* Title */}
        <div style={{
          color: 'white',
          fontSize: 72,
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: 20,
          lineHeight: 1.1,
        }}>
          Catálogo{' '}
          <span style={{ color: '#a78bfa' }}>Supply Chain</span>
        </div>

        {/* Subtitle */}
        <div style={{
          color: '#9ca3af',
          fontSize: 26,
          textAlign: 'center',
          maxWidth: 700,
          marginBottom: 44,
          lineHeight: 1.4,
        }}>
          Formación práctica basada en experiencia real
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { num: '59', label: 'cursos únicos' },
            { num: '7',  label: 'especializaciones' },
            { num: '~50%', label: 'de descuento' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '16px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span style={{ color: '#a78bfa', fontSize: 32, fontWeight: 800 }}>{s.num}</span>
              <span style={{ color: '#6b7280', fontSize: 16 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
