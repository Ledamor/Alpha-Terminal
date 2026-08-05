import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { api } from '../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, Input, Label, Button } from '@alpha/ui'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/auth-context'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/register', {
        email,
        username,
        password,
        confirmPassword
      })
      return response.data
    },
    onSuccess: () => {
      // Navigate to OTP verification page and pass the email via search params
      navigate({ 
        to: '/verify-email', 
        search: { email } 
      })
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
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    registerMutation.mutate()
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4 items-center text-center pb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription className="text-base">
              Join Alpha Terminal today
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="johndoe" 
                  required 
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 h-11 pr-10"
                  />
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/" className="font-semibold text-primary hover:underline ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
