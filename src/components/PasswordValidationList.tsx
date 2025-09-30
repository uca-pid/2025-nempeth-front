import React from 'react';

interface PasswordValidationListProps {
  password: string;
  className?: string;
}

interface PasswordChecks {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

const PasswordValidationList: React.FC<PasswordValidationListProps> = ({ 
  password, 
  className = "" 
}) => {
  const passwordChecks: PasswordChecks = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password)
  };

  const validationItems = [
    {
      key: 'minLength',
      text: 'Al menos 8 caracteres',
      isValid: passwordChecks.minLength
    },
    {
      key: 'hasLowercase',
      text: 'Una letra minúscula',
      isValid: passwordChecks.hasLowercase
    },
    {
      key: 'hasUppercase',
      text: 'Una letra mayúscula',
      isValid: passwordChecks.hasUppercase
    },
    {
      key: 'hasNumber',
      text: 'Un número',
      isValid: passwordChecks.hasNumber
    }
  ];

  return (
    <div className={`p-4 bg-gray-100 border border-gray-200 rounded-md ${className}`}>
      <p className="mb-2 text-sm font-semibold text-gray-700">
        La nueva contraseña debe contener:
      </p>
      <ul className="space-y-1 text-sm">
        {validationItems.map((item) => (
          <li
            key={item.key}
            className={`flex items-center gap-2 font-medium ${
              item.isValid ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span 
              className={`text-base ${
                item.isValid ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {item.isValid ? '✓' : '✗'}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordValidationList;