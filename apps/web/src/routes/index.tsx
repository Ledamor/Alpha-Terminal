import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold tracking-tight">Dashboard</h3>
      <p className="text-muted-foreground mt-2">Welcome to Alpha Terminal simulator.</p>
    </div>
  )
}
