import React from 'react'

const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`
          block w-full rounded-lg border 
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}
          px-3 py-2 
          bg-white 
          text-gray-900 
          placeholder-gray-400
          focus:outline-none focus:ring-2 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-none
          transition-colors duration-200
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Textarea