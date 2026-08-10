import React from 'react'

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-all duration-200"
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

export default Button