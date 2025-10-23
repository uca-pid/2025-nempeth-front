interface DescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  description: string
}

function DescriptionModal({ isOpen, onClose, productName, description }: DescriptionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header fijo */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
          <h2 id="modalTitle" className="flex-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {productName}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="text-base leading-relaxed text-gray-700 break-words whitespace-pre-wrap">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DescriptionModal



