interface DescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  description: string
}

function DescriptionModal({ isOpen, onClose, productName, description }: DescriptionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">Descripción - {productName}</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-2xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="rounded-lg bg-gray-50 p-6 text-base leading-relaxed text-gray-700">
            {description}
          </div>
        </div>
        
        {/* Footer fijo */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <button
            type="button"
            className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DescriptionModal