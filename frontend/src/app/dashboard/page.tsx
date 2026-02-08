"use client"

import { useDateRange } from "@/contexts/date-range-context"
import { format } from "date-fns"
import { BurnRateChart, MonthlySpendingData } from "@/components/charts/burn-rate-chart"
import { useState, useEffect, useCallback } from "react"
import { fetchWithAuth } from "@/lib/api-client"

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
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all transactions (we'll sum them up)
      const response = await fetchWithAuth(`/api/transactions?page=0&size=10000`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: PaginatedResponse = await response.json()
      const transactions = data.content || []

      // Filter by date range if provided
      let filteredTransactions = transactions
      if (dateRange?.from && dateRange?.to) {
        filteredTransactions = transactions.filter(t => {
          const txDate = new Date(t.transactionDate)
          return txDate >= dateRange.from! && txDate <= dateRange.to!
        })
      }

      // Calculate stats from transactions
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
      const totalBalance = savings // Net balance

      setStats({
        totalBalance,
        income,
        expenses,
        savings
      })

      // Fetch burn rate data with date range
      try {
        const burnRateUrl = dateRange?.from && dateRange?.to
          ? `/api/analytics/burn-rate?startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
          : '/api/analytics/burn-rate'
        const burnRateResponse = await fetch(burnRateUrl)
        if (burnRateResponse.ok) {
          const burnRateApiData = await burnRateResponse.json()

          // Transform API data to chart format - simple mapping for all months
          const chartData: MonthlySpendingData[] = burnRateApiData.map((item: any) => ({
            month: item.monthName.split(' ')[0], // Get month abbreviation (e.g., "Nov" from "Nov 2025")
            totalSpending: Number(item.totalSpent) || 0,
            isCurrentMonth: item.currentMonth || false
          }))

          setBurnRateData(chartData)
        }
      } catch (burnRateError) {
        console.error('Burn rate fetch error:', burnRateError)
        // Don't fail the whole dashboard if burn rate fails
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
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
            {loading ? "..." : formatCurrency(stats.totalBalance)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "..." : `+${formatCurrency(stats.income)}`}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {loading ? "..." : `-${formatCurrency(stats.expenses)}`}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
          <p className={`text-2xl font-bold ${stats.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {loading ? "..." : formatCurrency(stats.savings)}
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
            No burn rate data available
          </div>
        )}
      </div>
    </div>
  )
}
