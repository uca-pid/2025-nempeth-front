interface EmptyStateProps {
  onAddProduct: () => void
}

function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
      <div className="text-6xl">📦</div>
      <h3 className="mt-4 text-2xl font-semibold text-gray-700">No hay productos registrados</h3>
      <p className="mt-2 text-base text-gray-500">Comienza agregando tu primer producto</p>
      <button
        className="mt-6 rounded-xl bg-[#2563eb] px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-600"
        onClick={onAddProduct}
        type="button"
      >
        Agregar Primer Producto
      </button>
    </div>
  )
}

export default EmptyState