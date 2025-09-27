import React, { useState } from 'react'
import { UserService } from '../services/userService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import Modal from '../components/Modal'
import { IoEye, IoEyeOff } from 'react-icons/io5'

interface EditProfileProps {
  onBack?: () => void
}

function EditProfile({ onBack }: EditProfileProps) {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.name || '',
    apellido: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sincroniza formData con user cuando user cambie (por fetchUserProfile)
  React.useEffect(() => {
    if (user?.name || user?.lastName) {
      setFormData(prev => ({
        ...prev,
        nombre: user?.name || '',
        apellido: user?.lastName || '',
        email: user?.email || ''
      }));
    }
  }, [user]);

  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estados para el modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onConfirm: undefined as (() => void) | undefined
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    })
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  const handleModalConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm()
    }
    closeModal()
  }

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await UserService.updateProfile(
        user?.userId,
        {
          name: formData.nombre,
          lastName: formData.apellido
        }
      );
      // Actualiza el contexto global de usuario
      updateUser({ name: formData.nombre, lastName: formData.apellido });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordSection(false);
      showModal('¡Éxito!', 'Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      showModal('Error', 'No se pudo guardar el perfil. Por favor, inténtalo de nuevo.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showModal('Error de validación', 'Las contraseñas no coinciden. Por favor, verifica que ambas contraseñas sean iguales.', 'error');
      return;
    }
    if (formData.newPassword.length < 8) {
      showModal('Error de validación', 'La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      showModal('Error de validación', 'La contraseña debe contener al menos una letra minúscula.', 'error');
      return;
    }
    if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      showModal('Error de validación', 'La contraseña debe contener al menos una letra mayúscula.', 'error');
      return;
    }
    if (!/(?=.*\d)/.test(formData.newPassword)) {
      showModal('Error de validación', 'La contraseña debe contener al menos un número.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await UserService.updatePassword(
        user?.userId,
        {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
        }
      );
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordSection(false);
      showModal(
        '¡Contraseña actualizada!', 
        'Tu contraseña ha sido cambiada exitosamente. Por seguridad, deberás iniciar sesión nuevamente con tus nuevas credenciales.', 
        'success',
        () => logout() // Se ejecuta al hacer clic en Aceptar
      );
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      showModal('Error', 'No se pudo cambiar la contraseña. Por favor, verifica que tu contraseña actual sea correcta.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteAccount = () => {
    showModal(
      '⚠️ Eliminar Cuenta',
      'Esta acción es IRREVERSIBLE. Se eliminará permanentemente tu cuenta y todos los datos asociados, incluyendo tus productos, historial y configuraciones. ¿Estás seguro de que deseas continuar?',
      'error',
      async () => {
        setIsLoading(true);
        try {
          await UserService.deleteAccount(user?.userId);
          showModal(
            'Cuenta eliminada',
            'Tu cuenta ha sido eliminada exitosamente.',
            'success',
            () => logout()
          );
        } catch (error) {
          console.error('Error al eliminar cuenta:', error);
          showModal('Error', 'No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo más tarde.', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    );
  }

  const canSaveProfile = formData.nombre.trim() && formData.apellido.trim()
  const canChangePassword = formData.currentPassword && 
                           formData.newPassword && 
                           formData.confirmPassword &&
                           formData.newPassword === formData.confirmPassword

  const baseInputClasses = 'w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-korven-brand focus:outline-none focus:ring-4 focus:ring-korven-brand/10 placeholder:text-gray-400';

  const outlinedButtonClasses = 'inline-flex min-w-[120px] items-center justify-center rounded-md border-2 border-korven-brand bg-white px-4 py-2 text-sm font-semibold text-korven-brand transition duration-200 hover:-translate-y-0.5 hover:bg-korven-brand hover:text-white hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none';

  const primaryButtonClasses = 'inline-flex min-w-[120px] items-center justify-center rounded-md border-2 border-korven-brand bg-korven-brand px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#e53e0e] hover:bg-[#e53e0e] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none';

  const dangerButtonClasses = 'inline-flex min-w-[120px] items-center justify-center rounded-md border-2 border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none';

  const renderLoadingContent = (loadingLabel: string, defaultLabel: string) => (
    <>
      {isLoading ? loadingLabel : defaultLabel}
      {isLoading && (
        <svg
          className="ml-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </>
  );

  const passwordChecks = {
    minLength: formData.newPassword.length >= 8,
    hasLowercase: /[a-z]/.test(formData.newPassword),
    hasUppercase: /[A-Z]/.test(formData.newPassword),
    hasNumber: /\d/.test(formData.newPassword)
  };

  return (
    <div className="min-h-screen bg-korven-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8 border-b-2 border-gray-200 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button
            onClick={() => (onBack ? onBack() : navigate('/home'))}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 transition duration-200 hover:-translate-x-0.5 hover:border-gray-300 hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Volver
          </button>
          <div className="sm:flex sm:flex-col">
            <h1 className="text-3xl font-bold text-gray-800">Editar Perfil</h1>
            <p className="mt-2 text-base text-gray-600 sm:mt-0">
              Actualiza tu información personal y configuración de cuenta
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 bg-gradient-to-br from-korven-brand to-korven-accent p-5 text-white sm:gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/40 bg-white/20 text-2xl font-bold uppercase backdrop-blur">
              <span>{formData.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold sm:text-xl">{formData.nombre} {formData.apellido}</h2>
              <p className="text-sm opacity-90 sm:text-base">{formData.email}</p>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            <div className="space-y-6">
              <h3 className="relative pl-3 text-lg font-semibold text-gray-900 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded before:bg-korven-brand before:content-['']">
                Información Personal
              </h3>

              <div className="space-y-5">
                <div className="flex flex-col">
                  <label htmlFor="nombre" className="mb-2 text-sm font-semibold text-gray-800">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    className={baseInputClasses}
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="apellido" className="mb-2 text-sm font-semibold text-gray-800">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    className={baseInputClasses}
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    placeholder="Ingresa tu apellido"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="mb-2 text-sm font-semibold text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`${baseInputClasses} cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600`}
                    value={formData.email}
                    disabled
                    title="El email no puede ser modificado"
                  />
                  <span className="mt-1 text-sm italic text-gray-500">El email no puede ser modificado</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="relative pl-3 text-lg font-semibold text-gray-900 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded before:bg-korven-brand before:content-['']">
                  Seguridad
                </h3>
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className={outlinedButtonClasses}
                >
                  {showPasswordSection ? 'Cancelar' : 'Cambiar Contraseña'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <div className="flex flex-col">
                    <label htmlFor="currentPassword" className="mb-2 text-sm font-semibold text-gray-800">
                      Contraseña Actual
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        className={baseInputClasses}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95"
                      >
                        {showCurrentPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="newPassword" className="mb-2 text-sm font-semibold text-gray-800">
                      Nueva Contraseña
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        className={baseInputClasses}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95"
                      >
                        {showNewPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-200 bg-gray-100 p-4">
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      La nueva contraseña debe contener:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li
                        className={`flex items-center gap-2 font-medium ${passwordChecks.minLength ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        <span className={`text-base ${passwordChecks.minLength ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordChecks.minLength ? '✓' : '✗'}
                        </span>
                        Al menos 8 caracteres
                      </li>
                      <li
                        className={`flex items-center gap-2 font-medium ${passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        <span className={`text-base ${passwordChecks.hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordChecks.hasLowercase ? '✓' : '✗'}
                        </span>
                        Una letra minúscula
                      </li>
                      <li
                        className={`flex items-center gap-2 font-medium ${passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        <span className={`text-base ${passwordChecks.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordChecks.hasUppercase ? '✓' : '✗'}
                        </span>
                        Una letra mayúscula
                      </li>
                      <li
                        className={`flex items-center gap-2 font-medium ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        <span className={`text-base ${passwordChecks.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                          {passwordChecks.hasNumber ? '✓' : '✗'}
                        </span>
                        Un número
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-gray-800">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        className={baseInputClasses}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition active:scale-95"
                      >
                        {showConfirmPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={!canChangePassword || isLoading}
                      className={primaryButtonClasses}
                    >
                      {renderLoadingContent('Cambiando...', 'Cambiar Contraseña')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center border-t border-gray-200 bg-gray-50 px-6 py-5 sm:px-8">
            <button
              onClick={handleSaveProfile}
              disabled={!canSaveProfile || isLoading}
              className={primaryButtonClasses}
            >
              {renderLoadingContent('Guardando...', 'Guardar Cambios')}
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center border-t border-gray-200 bg-gray-50 px-6 py-5 sm:px-8">
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className={dangerButtonClasses}
          >
            {renderLoadingContent('Eliminando...', 'Eliminar Cuenta')}
          </button>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm ? handleModalConfirm : undefined}
      />
    </div>
  )
}

export default EditProfile
