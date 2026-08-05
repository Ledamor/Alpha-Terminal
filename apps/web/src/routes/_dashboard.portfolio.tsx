import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/portfolio')({
  component: Portfolio,
})

function Portfolio() {
  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold tracking-tight">Portfolio</h3>
      <p className="text-muted-foreground mt-2">Manage your assets.</p>
    </div>
  )
}
