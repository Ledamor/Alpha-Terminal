import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import { socketService } from '../lib/socket'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@alpha/ui'
import { ArrowUpRight, ArrowDownRight, ArrowUpDown } from 'lucide-react'

export const Route = createFileRoute('/_dashboard/portfolio')({
  component: Portfolio,
})

type Position = {
  id: string
  symbol: string
  quantity: string
  averagePrice: string
  currentPrice: number
  currentValue: number
  pnl: number
}

type PortfolioData = {
  id: string
  balance: string
  positions: Position[]
  totalValue: number
  totalPnl: number
}

type SortConfig = {
  key: keyof Position
  direction: 'asc' | 'desc'
} | null

function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

  const { data: initialPortfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await api.get('/portfolio')
      return res.data.data
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (initialPortfolio) {
      setPortfolio(initialPortfolio)
    }
  }, [initialPortfolio])

  useEffect(() => {
    socketService.connect();

    const handlePriceUpdate = (data: { symbol: string, price: number }) => {
      setPortfolio(prev => {
        if (!prev) return prev;
        
        let hasChanges = false;
        let newTotalPositionsValue = 0;
        let newTotalPnl = 0;

        const newPositions = prev.positions.map(pos => {
          if (pos.symbol === data.symbol) {
            hasChanges = true;
            const quantity = Number(pos.quantity);
            const averagePrice = Number(pos.averagePrice);
            const currentPrice = data.price;
            const currentValue = quantity * currentPrice;
            const pnl = currentValue - (quantity * averagePrice);
            
            newTotalPositionsValue += currentValue;
            newTotalPnl += pnl;

            return {
              ...pos,
              currentPrice,
              currentValue,
              pnl
            };
          } else {
            newTotalPositionsValue += pos.currentValue;
            newTotalPnl += pos.pnl;
            return pos;
          }
        });

        if (!hasChanges) return prev;

        const balance = Number(prev.balance);
        const newTotalValue = balance + newTotalPositionsValue;

        return {
          ...prev,
          positions: newPositions,
          totalValue: newTotalValue,
          totalPnl: newTotalPnl
        };
      });
    };

    socketService.on('PRICE_UPDATED', handlePriceUpdate);

    return () => {
      socketService.off('PRICE_UPDATED', handlePriceUpdate);
    }
  }, [])

  const handleSort = (key: keyof Position) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedPositions = useMemo(() => {
    if (!portfolio) return []
    const sortableItems = [...portfolio.positions]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle string numericals
        if (sortConfig.key === 'quantity' || sortConfig.key === 'averagePrice') {
          aValue = Number(aValue)
          bValue = Number(bValue)
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [portfolio, sortConfig])

  if (isLoading || !portfolio) {
    return (
      <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full">
        Loading portfolio...
      </div>
    )
  }

  const formatCurrency = (val: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(val))
  }

  return (
    <div className="p-8 flex-1 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground mt-2">Manage your assets and track your performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{formatCurrency(portfolio.totalValue)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter">{formatCurrency(portfolio.balance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tighter flex items-center gap-1 ${portfolio.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {portfolio.totalPnl >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
              {formatCurrency(Math.abs(portfolio.totalPnl))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted shadow-sm">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-2">Symbol <ArrowUpDown className="h-4 w-4 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center gap-2">Quantity <ArrowUpDown className="h-4 w-4 opacity-50" /></div>
                </TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground transition-colors text-right" onClick={() => handleSort('pnl')}>
                  <div className="flex items-center justify-end gap-2">P&L <ArrowUpDown className="h-4 w-4 opacity-50" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No positions found. Head over to the Market to start trading!
                  </TableCell>
                </TableRow>
              ) : (
                sortedPositions.map((pos) => (
                  <TableRow key={pos.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-semibold">{pos.symbol}</TableCell>
                    <TableCell>{pos.quantity}</TableCell>
                    <TableCell>{formatCurrency(pos.averagePrice)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatCurrency(pos.currentPrice)}</TableCell>
                    <TableCell>{formatCurrency(pos.currentValue)}</TableCell>
                    <TableCell className={`text-right font-medium ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {pos.pnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {formatCurrency(Math.abs(pos.pnl))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
