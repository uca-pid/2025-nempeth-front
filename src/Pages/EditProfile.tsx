import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/EditProfile.css'
import { useAuth } from '../contexts/useAuth'
import {editUserProfile} from '../services/editUserDataService'

interface EditProfileProps {
  onBack?: () => void
}

function EditProfile({ onBack }: EditProfileProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: user?.name || '',
    apellido: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    
    try {

      await editUserProfile(user?.userId || '', {
        name: formData.nombre,
        lastname: formData.apellido
      })
      
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      setShowPasswordSection(false)
      
      
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      alert('Error al guardar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    if (formData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    handleSaveProfile()
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
    </div>
  )
}

export default EditProfile