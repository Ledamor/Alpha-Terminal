import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@alpha/ui'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,532.89</div>
            <p className="text-xs text-primary flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +2.5% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
            <span className="text-xl text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$100,000.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available cash to trade
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <span className="text-muted-foreground">P&L</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-$342.12</div>
            <p className="text-xs text-destructive flex items-center mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              -0.28% today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your most recent trading activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">AAPL</TableCell>
                  <TableCell>
                    <span className="text-primary font-medium">BUY</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">Executed</Badge>
                  </TableCell>
                  <TableCell className="text-right">15 @ $175.43</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TSLA</TableCell>
                  <TableCell>
                    <span className="text-destructive font-medium">SELL</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">Executed</Badge>
                  </TableCell>
                  <TableCell className="text-right">10 @ $214.12</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NVDA</TableCell>
                  <TableCell>
                    <span className="text-primary font-medium">BUY</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">5 @ $890.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
