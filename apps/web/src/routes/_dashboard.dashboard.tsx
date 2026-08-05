import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@alpha/ui'
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock Data for the Portfolio Chart (still mocked as we don't store historical portfolio values)
const portfolioData = [
  { name: '1', value: 100000 },
  { name: '2', value: 102000 },
  { name: '3', value: 101500 },
  { name: '4', value: 105000 },
  { name: '5', value: 108000 },
  { name: '6', value: 107500 },
  { name: '7', value: 112000 },
  { name: '8', value: 115000 },
  { name: '9', value: 114000 },
  { name: '10', value: 118000 },
  { name: '11', value: 120500 },
  { name: '12', value: 119000 },
  { name: '13', value: 122000 },
  { name: '14', value: 124532 },
]

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await api.get('/portfolio')
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })

  const { data: assets } = useQuery({
    queryKey: ['market-prices'],
    queryFn: async () => {
      const res = await api.get('/trading/prices')
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/trading/orders')
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(val))
  }

  const topAssets = assets ? assets.slice(0, 3) : []

  return (
    <div className="flex flex-1 flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {portfolio ? formatCurrency(portfolio.totalValue) : '...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Live from portfolio
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            <Activity className={portfolio && portfolio.totalPnl >= 0 ? "h-4 w-4 text-emerald-500" : "h-4 w-4 text-red-500"} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tracking-tight ${portfolio && portfolio.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {portfolio ? (portfolio.totalPnl >= 0 ? '+' : '') + formatCurrency(portfolio.totalPnl) : '...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center">
              All time return
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buying Power</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {portfolio ? formatCurrency(portfolio.balance) : '...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available cash to trade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout: Chart & Side Panel */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        
        {/* Main Chart Section */}
        <Card className="col-span-1 lg:col-span-5 border-muted bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Value over the last 14 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: 'hsl(var(--foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    formatter={(value: unknown) => [`$${Number(value ?? 0).toFixed(2)}`, 'Equity']}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          {/* Watchlist */}
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle>Top Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAssets.map((asset: any) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium leading-none">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground mt-1">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(asset.price)}</p>
                      <p className={`text-xs flex items-center justify-end font-medium ${asset.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {asset.change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {asset.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-muted bg-card/50 backdrop-blur-sm flex-1">
            <CardHeader className="pb-4">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders && orders.length > 0 ? orders.map((order: any) => (
                  <div key={order.id} className="flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${order.side === 'BUY' ? 'bg-primary/10 border-primary/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <span className={`text-xs font-bold ${order.side === 'BUY' ? 'text-primary' : 'text-red-500'}`}>{order.side}</span>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {order.side === 'BUY' ? 'Bought' : 'Sold'} {order.quantity} {order.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.type} order executed at {formatCurrency(order.executionPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground py-4">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
