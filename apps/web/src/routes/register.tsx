import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, verifyOtpSchema } from '@alpha/validation'
import type { RegisterInput, VerifyOtpInput } from '@alpha/types'
import { api } from '../lib/axios'
import { useAuth } from '../contexts/auth-context'
import { useState } from 'react'
import { isAxiosError } from 'axios'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'register' | 'otp'>('register')
  const [emailToVerify, setEmailToVerify] = useState<string>('')
  
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
  })

  const onRegisterSubmit = async (data: RegisterInput) => {
    try {
      setError(null)
      await api.post('/auth/register', data)
      setEmailToVerify(data.email)
      otpForm.setValue('email', data.email)
      setStep('otp')
    } catch (err) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(Array.isArray(message) ? message.join(', ') : message || 'Failed to register')
      } else {
        setError('Failed to register')
      }
    }
  }

  const onOtpSubmit = async (data: VerifyOtpInput) => {
    try {
      setError(null)
      await api.post('/auth/verify-otp', data)
      await login() // Populate user state
      navigate({ to: '/market' })
    } catch (err) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(Array.isArray(message) ? message.join(', ') : message || 'Failed to verify OTP')
      } else {
        setError('Failed to verify OTP')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground dark p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8 relative">
        <button 
          onClick={() => navigate({ to: '/login' })}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
          aria-label="Back to login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <div className="mb-8 text-center mt-2">
          <h1 className="text-3xl font-bold text-primary mb-2">Alpha Terminal</h1>
          <p className="text-muted-foreground">
            {step === 'register' ? 'Create a new account' : 'Verify your email'}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {step === 'register' ? (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                {...registerForm.register('username')}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="johndoe"
              />
              {registerForm.formState.errors.username && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...registerForm.register('email')}
                type="email"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
              {registerForm.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                {...registerForm.register('password')}
                type="password"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              {registerForm.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                {...registerForm.register('confirmPassword')}
                type="password"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 mt-6"
            >
              {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div className="text-sm text-center mb-4 text-muted-foreground">
              We've sent a 6-digit code to <strong>{emailToVerify}</strong>.
              <br/>(Check your backend console for the mock email!)
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">6-Digit Code</label>
              <input
                {...otpForm.register('code')}
                autoComplete="one-time-code"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg"
                placeholder="000000"
                maxLength={6}
              />
              {otpForm.formState.errors.code && (
                <p className="text-destructive text-xs mt-1">{otpForm.formState.errors.code.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={otpForm.formState.isSubmitting}
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 mt-6"
            >
              {otpForm.formState.isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}
