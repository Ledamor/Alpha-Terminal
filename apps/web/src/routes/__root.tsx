import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { LayoutDashboard, Briefcase, LineChart, Settings, Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@alpha/ui'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased text-foreground dark">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 items-center border-b border-border px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            Alpha Terminal
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            <Link
              to="/"
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
              to="/"
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
              <span className="font-semibold text-primary">$100,000.00</span>
            </div>
            <button className="relative rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
            </button>
            <Avatar className="h-8 w-8 cursor-pointer border border-border">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
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
