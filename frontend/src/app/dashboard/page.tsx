"use client"

import { useDateRange } from "@/contexts/date-range-context"
import { format } from "date-fns"
import { BurnRateChart, MonthlySpendingData } from "@/components/charts/burn-rate-chart"
import { useState, useEffect, useCallback } from "react"

interface DashboardStats {
  totalBalance: number
  income: number
  expenses: number
  savings: number
}

interface Transaction {
  id: string
  amount: number
  transactionDate: string
  category: string | null
}

interface PaginatedResponse {
  content: Transaction[]
  totalElements: number
}

export default function DashboardPage() {
  const { dateRange } = useDateRange()
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    savings: 0
  })
  const [burnRateData, setBurnRateData] = useState<MonthlySpendingData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      // Fetch all transactions within date range
      const startDate = format(dateRange.from, "yyyy-MM-dd'T'00:00:00")
      const endDate = format(dateRange.to, "yyyy-MM-dd'T'23:59:59")

      // Fetch transactions (get all for the date range)
      const response = await fetch(`/api/transactions?page=0&size=10000`)
      if (!response.ok) throw new Error('Failed to fetch transactions')

      const data: PaginatedResponse = await response.json()
      const transactions = data.content

      // Filter transactions by date range
      const filteredTransactions = transactions.filter(t => {
        const txDate = new Date(t.transactionDate)
        return txDate >= dateRange.from! && txDate <= dateRange.to!
      })

      // Calculate stats
      let income = 0
      let expenses = 0

      filteredTransactions.forEach(t => {
        if (t.amount > 0) {
          income += t.amount
        } else {
          expenses += Math.abs(t.amount)
        }
      })

      const savings = income - expenses

      setStats({
        totalBalance: income - expenses, // Simplified calculation
        income,
        expenses,
        savings
      })

      // Fetch burn rate data
      const burnRateResponse = await fetch('/api/analytics/burn-rate')
      if (burnRateResponse.ok) {
        const burnRateApiData = await burnRateResponse.json()

        // Transform API data to chart format
        const chartData: MonthlySpendingData[] = burnRateApiData.map((item: any) => ({
          month: item.monthName.split(' ')[0], // Just get the month abbreviation
          totalSpending: item.totalSpent,
          isCurrentMonth: item.currentMonth
        }))

        // Add cumulative data points for current month
        const currentMonthData = chartData.filter(d => d.isCurrentMonth)
        const previousMonthsData = chartData.filter(d => !d.isCurrentMonth)

        if (currentMonthData.length > 0) {
          const currentTotal = currentMonthData[0].totalSpending
          const today = new Date()
          const dayOfMonth = today.getDate()

          // Create cumulative points for current month
          const cumulativePoints: MonthlySpendingData[] = []
          const pointsCount = Math.min(5, dayOfMonth)

          for (let i = 1; i <= pointsCount; i++) {
            const day = Math.floor((dayOfMonth / pointsCount) * i)
            const cumulative = Math.floor((currentTotal / dayOfMonth) * day)
            cumulativePoints.push({
              month: `${format(today, 'MMM')} ${day}`,
              totalSpending: 0,
              cumulativeSpending: cumulative,
              isCurrentMonth: true,
              day
            })
          }

          setBurnRateData([...previousMonthsData, ...cumulativePoints])
        } else {
          setBurnRateData(previousMonthsData)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))

    if (showSign) {
      return amount >= 0 ? `+${formatted}` : `-${formatted}`
    }
    return formatted
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your financial overview
          {dateRange?.from && dateRange?.to && (
            <span className="ml-2">
              ({format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")})
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
          <p className="text-2xl font-bold">
            {loading ? "Loading..." : formatCurrency(stats.totalBalance)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "Loading..." : formatCurrency(stats.income, true)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {loading ? "Loading..." : `-${formatCurrency(stats.expenses)}`}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
          <p className={`text-2xl font-bold ${stats.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {loading ? "Loading..." : formatCurrency(stats.savings)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-slate-900 p-6 shadow">
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-slate-400">
            Loading chart data...
          </div>
        ) : burnRateData.length > 0 ? (
          <BurnRateChart data={burnRateData} />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-slate-400">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  )
}
