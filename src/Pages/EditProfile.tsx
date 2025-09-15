import React, { useState } from 'react'
import { UserService } from '../services/userService'
import { useNavigate } from 'react-router-dom'
import '../Styles/EditProfile.css'
import { useAuth } from '../contexts/useAuth'
import Modal from '../components/Modal'

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
    if (formData.newPassword.length < 6) {
      showModal('Error de validación', 'La contraseña debe tener al menos 6 caracteres.', 'error');
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

  const canSaveProfile = formData.nombre.trim() && formData.apellido.trim()
  const canChangePassword = formData.currentPassword && 
                           formData.newPassword && 
                           formData.confirmPassword &&
                           formData.newPassword === formData.confirmPassword

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <div className="header-left">
          <button onClick={() => onBack ? onBack() : navigate('/home')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Volver
          </button>
          <h1 className="page-title">Editar Perfil</h1>
          <p className="page-subtitle">
            Actualiza tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      <div className="edit-profile-content">
        <div className="profile-card">
          <div className="card-header">
            <div className="user-avatar-large">
              <span>{formData.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <div className="user-info-large">
              <h2 className="user-name">{formData.nombre} {formData.apellido}</h2>
              <p className="user-email">{formData.email}</p>
            </div>
          </div>

          <div className="card-content">
            <div className="form-section">
              <h3 className="section-title">Información Personal</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido" className="form-label">Apellido</label>
                  <input
                    type="text"
                    id="apellido"
                    className="form-input"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    placeholder="Ingresa tu apellido"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input disabled"
                    value={formData.email}
                    disabled
                    title="El email no puede ser modificado"
                  />
                  <span className="form-help">El email no puede ser modificado</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Seguridad</h3>
                <button 
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="btn btn-outline"
                >
                  {showPasswordSection ? 'Cancelar' : 'Cambiar Contraseña'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="password-section">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="form-input"
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-input"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      onClick={handleChangePassword}
                      disabled={!canChangePassword || isLoading}
                      className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                    >
                      {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="global-form-actions">
            <button 
              onClick={handleSaveProfile}
              disabled={!canSaveProfile || isLoading}
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
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