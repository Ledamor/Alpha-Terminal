import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '../contexts/auth-context'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground dark">
        <Outlet />
      </div>
    </AuthProvider>
  )
}
