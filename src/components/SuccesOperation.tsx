import React, { useEffect } from 'react';
import '../Styles/SuccesOperation.css';

interface SuccesOperationProps {
  message?: string;
  onClose?: () => void;
  autoCloseDelay?: number;
}

const SuccesOperation: React.FC<SuccesOperationProps> = ({ 
  message, 
  onClose, 
  autoCloseDelay = 3000 
}) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [onClose, autoCloseDelay]);
  
  return (
    <div className="succes-operation-overlay">
      <div className="succes-operation-container">
        <div className="succes-icon">
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
            <path 
              d="M9 12l2 2 4-4" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="succes-title">Cuenta creada de manera exitosa</h2>
        {message && (
          <p className="succes-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SuccesOperation;
