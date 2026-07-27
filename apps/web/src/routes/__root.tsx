import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64 border-r border-border">
          <div className="p-4 font-bold text-xl">Alpha Terminal</div>
        </div>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools />
    </div>
  ),
})
