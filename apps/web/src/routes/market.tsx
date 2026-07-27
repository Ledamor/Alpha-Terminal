import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/market')({
  component: Market,
})

function Market() {
  return (
    <div className="p-2">
      <h3 className="text-2xl font-bold tracking-tight">Market</h3>
      <p className="text-muted-foreground mt-2">Live market simulator.</p>
    </div>
  )
}
