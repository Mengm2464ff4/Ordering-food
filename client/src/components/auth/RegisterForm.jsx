import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi'
import { AuthContext } from '../../context/AuthContext'
import Button from '../common/Button'
import Input from '../common/Input'
import toast from 'react-hot-toast'

const RegisterForm = () => {
  const { register: registerUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: {
        street: data.street,
        city: data.city,
        district: data.district,
        commune: data.commune,
      },
    }
    
    const success = await registerUser(userData)
    setIsLoading(false)
    
    if (success) {
      toast.success('Registration successful! Welcome aboard!')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <FiUserPlus className="text-white text-2xl" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start ordering delicious food
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiUser className="text-orange-500" />
                Personal Information
              </h3>
            </div>

            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              register={register}
              validation={{
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
              error={errors.name?.message}
              icon={FiUser}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              register={register}
              validation={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              error={errors.email?.message}
              icon={FiMail}
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="+855 12 345 678"
              register={register}
              validation={{
                required: 'Phone number is required',
                pattern: {
                  value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,6}$/,
                  message: 'Invalid phone number',
                },
              }}
              error={errors.phone?.message}
              icon={FiPhone}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                register={register}
                validation={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)/,
                    message: 'Password must contain at least one letter and one number',
                  },
                }}
                error={errors.password?.message}
                icon={FiLock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                register={register}
                validation={{
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                }}
                error={errors.confirmPassword?.message}
                icon={FiLock}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Address Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiMapPin className="text-orange-500" />
                Delivery Address (Optional)
              </h3>
            </div>

            <Input
              label="Street Address"
              name="street"
              placeholder="123 Main Street"
              register={register}
              error={errors.street?.message}
            />

            <Input
              label="City"
              name="city"
              placeholder="Phnom Penh"
              register={register}
              error={errors.city?.message}
            />

            <Input
              label="District"
              name="district"
              placeholder="Chamkar Mon"
              register={register}
              error={errors.district?.message}
            />

            <Input
              label="Commune"
              name="commune"
              placeholder="Tonle Bassac"
              register={register}
              error={errors.commune?.message}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                {...register('terms', { required: 'You must agree to the terms' })}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </Link>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm