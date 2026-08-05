import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, Briefcase, LineChart, Settings, Bell, Search, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@alpha/ui'
import { useAuth } from '../contexts/auth-context'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: portfolioRes } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await api.get('/portfolio')
      return res.data.data
    },
    enabled: isAuthenticated
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null // Prevent flash of content

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            Alpha Terminal
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/portfolio"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
            >
              <Briefcase className="h-4 w-4" />
              Portfolio
            </Link>
            <Link
              to="/market"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
            >
              <LineChart className="h-4 w-4" />
              Market
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="grid items-start text-sm font-medium gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </aside>
      
      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:h-[60px] lg:px-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search stocks..."
                className="w-full appearance-none bg-background pl-8 shadow-none h-9 rounded-md border border-input text-sm px-3 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Buying Power:</span>
              <span className="font-semibold text-primary">
                ${portfolioRes ? Number(portfolioRes.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
              </span>
            </div>
            <button className="relative rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border transition-opacity hover:opacity-80">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel>@{user?.username || 'Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
