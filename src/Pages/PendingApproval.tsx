import { useAuth } from '../contexts/useAuth'

// Informs employees that their account awaits owner's approval
function PendingApproval() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Tu cuenta está pendiente</h1>
        <p className="mt-4 text-sm text-gray-600">
          Un administrador debe confirmar tu acceso antes de poder usar la plataforma. Recibirás una notificación cuando estés activo.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default PendingApproval
