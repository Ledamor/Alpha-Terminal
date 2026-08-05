import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { api } from '../lib/axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Label,
  Badge,
} from '@alpha/ui'
import { Search, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export const Route = createFileRoute('/_dashboard/market')({
  component: Market,
})

// --- Mock Data ---
type Asset = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  chartData: { time: string; price: number }[]
}

const generateMockChart = (startPrice: number, volatility: number) => {
  const data = []
  let currentPrice = startPrice
  for (let i = 1; i <= 30; i++) {
    const change = currentPrice * (Math.random() * volatility - (volatility / 2))
    currentPrice += change
    data.push({ time: `Day ${i}`, price: Number(currentPrice.toFixed(2)) })
  }
  // Force the last point to equal the current actual price for consistency
  data[data.length - 1].price = startPrice
  return data
}

const mockAssets: Asset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24, volume: '45.2M', chartData: generateMockChart(175.43, 0.04) },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 214.12, change: -7.50, changePercent: -3.38, volume: '112.5M', chartData: generateMockChart(214.12, 0.08) },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 890.00, change: 35.50, changePercent: 4.15, volume: '68.1M', chartData: generateMockChart(890.00, 0.06) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: 1.10, changePercent: 0.27, volume: '22.4M', chartData: generateMockChart(415.20, 0.03) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.15, change: -1.25, changePercent: -0.70, volume: '38.9M', chartData: generateMockChart(178.15, 0.05) },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.50, change: 12.30, changePercent: 2.60, volume: '18.7M', chartData: generateMockChart(485.50, 0.07) },
]

function Market() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset>(mockAssets[0])
  
  // Order Panel State
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [quantity, setQuantity] = useState<string>('1')
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return mockAssets
    return mockAssets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const qty = parseFloat(quantity) || 0
  const estimatedCost = (qty * selectedAsset.price).toFixed(2)

  const orderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/trading/order', {
        symbol: selectedAsset.symbol,
        side: orderSide,
        quantity: qty
      })
      return response.data
    },
    onSuccess: () => {
      setSuccess(`Successfully ${orderSide === 'BUY' ? 'bought' : 'sold'} ${qty} shares of ${selectedAsset.symbol}!`)
      setQuantity('1')
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      setTimeout(() => setSuccess(null), 5000)
    },
    onError: (err: AxiosError) => {
      if (err.response?.data && (err.response.data as any).message) {
        setError(Array.isArray((err.response.data as any).message) ? (err.response.data as any).message.join(', ') : (err.response.data as any).message)
      } else {
        setError('An unexpected error occurred.')
      }
      setTimeout(() => setError(null), 5000)
    }
  })

  const handleOrder = () => {
    setError(null)
    setSuccess(null)
    if (qty <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    orderMutation.mutate()
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Market</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Pane: Asset Screener */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search symbols or names..."
              className="pl-8 bg-card/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => {
                  setSelectedAsset(asset)
                  setError(null)
                  setSuccess(null)
                }}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedAsset.symbol === asset.symbol
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-card/50 border-border/50 hover:bg-card hover:border-border'
                }`}
              >
                <div>
                  <h4 className="font-bold">{asset.symbol}</h4>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${asset.price.toFixed(2)}</p>
                  <p
                    className={`text-xs font-medium flex items-center justify-end ${
                      asset.change >= 0 ? 'text-primary' : 'text-destructive'
                    }`}
                  >
                    {asset.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {asset.change > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
            {filteredAssets.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                No assets found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Details & Chart */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto">
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-bold tracking-tight">{selectedAsset.symbol}</h2>
                <Badge variant="outline" className="text-xs bg-muted/50">{selectedAsset.name}</Badge>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-bold">${selectedAsset.price.toFixed(2)}</span>
                <span
                  className={`text-lg font-medium flex items-center ${
                    selectedAsset.change >= 0 ? 'text-primary' : 'text-destructive'
                  }`}
                >
                  {selectedAsset.change > 0 ? '+' : ''}{selectedAsset.change.toFixed(2)} ({selectedAsset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Market Status</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">Open</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Vol: {selectedAsset.volume}</p>
            </div>
          </div>

          {/* Chart Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0 pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selectedAsset.chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedAsset.change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedAsset.change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--foreground))'
                      }}
                      itemStyle={{ color: selectedAsset.change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))', fontWeight: 'bold' }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={selectedAsset.change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle>Place Order</CardTitle>
                <CardDescription>Simulate a trade for {selectedAsset.symbol}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Buy/Sell Toggle */}
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                  <button
                    onClick={() => setOrderSide('BUY')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                      orderSide === 'BUY' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderSide('SELL')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                      orderSide === 'SELL' 
                        ? 'bg-destructive text-destructive-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Order Type Toggle */}
                <div className="space-y-3">
                  <Label>Order Type</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={orderType === 'MARKET' ? 'default' : 'outline'}
                      onClick={() => setOrderType('MARKET')}
                      className="flex-1 h-9"
                    >
                      <Clock className="w-4 h-4 mr-2" /> Market
                    </Button>
                    <Button 
                      type="button" 
                      variant={orderType === 'LIMIT' ? 'default' : 'outline'}
                      onClick={() => setOrderType('LIMIT')}
                      className="flex-1 h-9"
                      disabled
                      title="Limit orders coming soon"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Limit
                    </Button>
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quantity">Quantity (Shares)</Label>
                  </div>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1" 
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 text-lg font-bold bg-background/50"
                  />
                </div>
                
                {error && (
                  <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm font-medium text-primary bg-primary/10 rounded-md border border-primary/20">
                    {success}
                  </div>
                )}

              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between mb-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
                  <span className="text-xl font-bold">${estimatedCost}</span>
                </div>
                <Button 
                  onClick={handleOrder}
                  disabled={orderMutation.isPending}
                  className={`w-full h-12 text-lg font-bold ${
                    orderSide === 'BUY' 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  }`}
                >
                  {orderMutation.isPending ? "Executing..." : `${orderSide} ${selectedAsset.symbol}`}
                </Button>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle>Asset Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Previous Close</span>
                  <span className="font-medium">${(selectedAsset.price - selectedAsset.change).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Open</span>
                  <span className="font-medium">${(selectedAsset.price - selectedAsset.change + (Math.random() * 2 - 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground text-sm">Volume</span>
                  <span className="font-medium">{selectedAsset.volume}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-sm">Avg. Volume</span>
                  <span className="font-medium">{(parseFloat(selectedAsset.volume) * 1.1).toFixed(1)}M</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  )
}

