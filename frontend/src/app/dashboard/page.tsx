"use client"

import { useDateRange } from "@/contexts/date-range-context"
import { format } from "date-fns"
import { BurnRateChart, sampleBurnRateData } from "@/components/charts/burn-rate-chart"

export default function DashboardPage() {
  const { dateRange } = useDateRange()

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
          <p className="text-2xl font-bold">$12,456.78</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
          <p className="text-2xl font-bold text-green-600">+$4,230.00</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
          <p className="text-2xl font-bold text-red-600">-$2,845.50</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
          <p className="text-2xl font-bold text-blue-600">$1,384.50</p>
        </div>
      </div>

      <div className="rounded-xl border bg-slate-900 p-6 shadow">
        <BurnRateChart data={sampleBurnRateData} />
      </div>
    </div>
  )
}
