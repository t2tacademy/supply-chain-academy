import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/supabase'
import AdminOrders from '@/components/AdminOrders'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

export default async function AdminPage() {
  const orders = await getOrders()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A0A0F] text-white px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase mb-1">T2T Academy</p>
            <h1 className="text-2xl font-extrabold">Panel de Órdenes — Supply Chain</h1>
          </div>
          <p className="text-gray-400 text-sm hidden sm:block">
            Actualizado: {new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdminOrders orders={orders} />
      </div>
    </div>
  )
}
