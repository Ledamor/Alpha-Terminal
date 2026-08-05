import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@alpha/ui'
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock Data for the Portfolio Chart
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
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">$124,532.89</div>
            <p className="text-xs text-primary flex items-center mt-1 font-medium">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2.5% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Return</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">-$342.12</div>
            <p className="text-xs text-destructive flex items-center mt-1 font-medium">
              <TrendingDown className="mr-1 h-3 w-3" />
              -0.28% today
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buying Power</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">$100,000.00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available cash to trade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout: Chart & Side Panel */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7">
        
        {/* Main Chart Section */}
        <Card className="col-span-1 lg:col-span-5 border-border/50 bg-card/50 backdrop-blur-sm">
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
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Equity']}
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
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">AAPL</p>
                    <p className="text-xs text-muted-foreground mt-1">Apple Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$175.43</p>
                    <p className="text-xs text-primary flex items-center justify-end font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" /> +1.2%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">TSLA</p>
                    <p className="text-xs text-muted-foreground mt-1">Tesla Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$214.12</p>
                    <p className="text-xs text-destructive flex items-center justify-end font-medium">
                      <ArrowDownRight className="h-3 w-3 mr-0.5" /> -3.4%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">NVDA</p>
                    <p className="text-xs text-muted-foreground mt-1">NVIDIA Corp.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$890.00</p>
                    <p className="text-xs text-primary flex items-center justify-end font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" /> +4.2%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex-1">
            <CardHeader className="pb-4">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="text-xs font-bold text-primary">BUY</span>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Bought 15 AAPL</p>
                    <p className="text-xs text-muted-foreground">Market order executed at $175.43</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20">
                    <span className="text-xs font-bold text-destructive">SELL</span>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Sold 10 TSLA</p>
                    <p className="text-xs text-muted-foreground">Limit order executed at $214.12</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">Deposit Received</p>
                    <p className="text-xs text-muted-foreground">Successfully added $100,000 to buying power.</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
