import React, { useState } from 'react';

// Componente de Input moderno e reutilizável
export const ModernInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = '', 
  className = '',
  primaryColor = '#3B82F6'
}) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0 bg-white ${
            error 
              ? 'border-red-300 focus:border-red-400' 
              : isFocused 
                ? `border-[${primaryColor}] shadow-md` 
                : 'border-gray-200 hover:border-gray-300'
          } ${isFocused ? 'transform scale-[1.01]' : ''}`}
          style={{
            borderColor: isFocused && !error ? primaryColor : undefined,
            boxShadow: isFocused && !error ? `0 0 0 3px ${primaryColor}15` : undefined
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  )
};

// Componente de TextArea moderno
export const ModernTextArea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = '', 
  rows = 4,
  className = '',
  primaryColor = '#3B82F6'
}) => {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0 resize-none bg-white ${
            error 
              ? 'border-red-300 focus:border-red-400' 
              : isFocused 
                ? `border-[${primaryColor}] shadow-md` 
                : 'border-gray-200 hover:border-gray-300'
          } ${isFocused ? 'transform scale-[1.01]' : ''}`}
          style={{
            borderColor: isFocused && !error ? primaryColor : undefined,
            boxShadow: isFocused && !error ? `0 0 0 3px ${primaryColor}15` : undefined
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  )
}; 
