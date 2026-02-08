"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"

// Burn rate data interface
interface BurnRateData {
    monthName: string
    totalSpent: number
    isCurrentMonth: boolean
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as BurnRateData
        return (
            <div className="bg-background border rounded-lg shadow-lg p-3">
                <p className="font-semibold">{data.monthName}</p>
                <p className="text-muted-foreground">
                    Spent: <span className="text-foreground font-medium">
                        ${data.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </p>
                {data.isCurrentMonth && (
                    <p className="text-xs text-amber-500 mt-1">Current Month</p>
                )}
            </div>
        )
    }
    return null
}

export function BurnRateChart() {
    const [data, setData] = useState<BurnRateData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBurnRate()
    }, [])

    const fetchBurnRate = async () => {
        try {
            setLoading(true)
            const response = await fetchWithAuth('/api/analytics/burn-rate')
            if (!response.ok) {
                throw new Error('Failed to fetch burn rate data')
            }
            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Calculate trend
    const calculateTrend = () => {
        if (data.length < 2) return { trend: 'neutral', percentage: 0 }

        const currentMonth = data.find(d => d.isCurrentMonth)
        const previousMonth = data[data.length - 2]

        if (!currentMonth || !previousMonth || previousMonth.totalSpent === 0) {
            return { trend: 'neutral', percentage: 0 }
        }

        const change = ((currentMonth.totalSpent - previousMonth.totalSpent) / previousMonth.totalSpent) * 100

        if (change > 5) return { trend: 'up', percentage: Math.abs(change) }
        if (change < -5) return { trend: 'down', percentage: Math.abs(change) }
        return { trend: 'neutral', percentage: Math.abs(change) }
    }

    const { trend, percentage } = calculateTrend()

    // Colors for the bars
    const CURRENT_MONTH_COLOR = "#f59e0b" // Amber for current month (velocity indicator)
    const PAST_MONTH_COLOR = "#3b82f6" // Blue for past months

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Burn Rate</CardTitle>
                    <CardDescription>Loading spending velocity...</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Burn Rate</CardTitle>
                    <CardDescription>Error loading data</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-destructive">{error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Burn Rate
                            {trend === 'up' && (
                                <TrendingUp className="h-5 w-5 text-red-500" />
                            )}
                            {trend === 'down' && (
                                <TrendingDown className="h-5 w-5 text-green-500" />
                            )}
                            {trend === 'neutral' && (
                                <Minus className="h-5 w-5 text-muted-foreground" />
                            )}
                        </CardTitle>
                        <CardDescription>
                            Monthly spending velocity over the last 4 months
                        </CardDescription>
                    </div>
                    {percentage > 0 && (
                        <div className={`text-sm font-medium ${trend === 'up' ? 'text-red-500' :
                            trend === 'down' ? 'text-green-500' :
                                'text-muted-foreground'
                            }`}>
                            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
                            {percentage.toFixed(1)}% vs last month
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="monthName"
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="totalSpent"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isCurrentMonth ? CURRENT_MONTH_COLOR : PAST_MONTH_COLOR}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: PAST_MONTH_COLOR }} />
                        <span className="text-muted-foreground">Past Months</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: CURRENT_MONTH_COLOR }} />
                        <span className="text-muted-foreground">Current Month</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
