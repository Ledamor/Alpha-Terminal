import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { api } from '../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, Input, Label, Button } from '@alpha/ui'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../contexts/auth-context'

// Define the search params this route expects
type VerifyEmailSearch = {
  email?: string
}

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => {
    return {
      email: search.email as string | undefined,
    }
  },
})

function VerifyEmailPage() {
  const { email } = Route.useSearch()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
    // If no email is in the URL, bounce back to register
    if (!email) {
      navigate({ to: '/register' })
    }
  }, [isAuthenticated, email, navigate])

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/verify-otp', {
        email,
        code
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        login(data.data.token)
      }
      navigate({ to: '/dashboard' })
    },
    onError: (err: AxiosError) => {
      if (err.response?.data && (err.response.data as any).message) {
        setError(Array.isArray((err.response.data as any).message) ? (err.response.data as any).message.join(', ') : (err.response.data as any).message)
      } else {
        setError('An unexpected error occurred. Is the API server running?')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    verifyMutation.mutate()
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4 items-center text-center pb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="code" className="sr-only">Verification Code</Label>
                <Input 
                  id="code" 
                  type="text" 
                  placeholder="123456" 
                  required 
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                  className="bg-background/50 h-14 text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold"
              disabled={verifyMutation.isPending || code.length !== 6}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-6 text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          <button type="button" className="font-semibold text-primary hover:underline ml-1">
            Resend
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
