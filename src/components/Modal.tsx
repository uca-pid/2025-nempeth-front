import React from 'react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  showCancelButton?: boolean
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCancelButton = false,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <div className="modal-icon modal-icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="modal-icon modal-icon-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
        )
      default:
        return (
          <div className="modal-icon modal-icon-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="l 0,-4 0,8"></path>
              <path d="l 0,4 .01,0"></path>
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${type}`}>
        <div className="modal-header">
          {getIconByType()}
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          {showCancelButton && (
            <button className="btn btn-outline" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button className={`btn btn-primary ${type === 'error' ? 'btn-error' : ''}`} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal