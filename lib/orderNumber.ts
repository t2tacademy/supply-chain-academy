// Número de orden legible para el cliente y para Gustavo, derivado del UUID de la orden
// (no requiere columna nueva). Ej: 3f9a1c07-... → SCA-3F9A1C07
export function formatOrderNumber(id: string): string {
  return 'SCA-' + id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export const ORDER_NUMBER_RE = /^SCA-[0-9A-F]{8}$/
