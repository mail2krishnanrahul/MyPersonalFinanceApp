"use client"

import React, { useMemo } from "react"
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

// Pro-democracy blue and gold color palette
const COLORS = {
    blue: "#1e40af",        // Deep blue
    lightBlue: "#3b82f6",   // Lighter blue
    gold: "#f59e0b",        // Gold
    lightGold: "#fbbf24",   // Lighter gold
    background: "#1e293b",  // Dark background for contrast
}

export interface MonthlySpendingData {
    month: string           // e.g., "Nov", "Dec", "Jan", "Feb"
    totalSpending: number   // Total spending for the month
    isCurrentMonth?: boolean // Flag for current month data points
    day?: number            // Day of month (for current month cumulative data)
    cumulativeSpending?: number // Cumulative spending (for current month line)
}

interface BurnRateChartProps {
    data: MonthlySpendingData[]
    className?: string
}

interface CustomTooltipPayload {
    dataKey: string
    value: number
    payload: MonthlySpendingData & { percentageDiff?: number }
}

interface CustomTooltipProps {
    active?: boolean
    payload?: CustomTooltipPayload[]
    label?: string
}

function CustomTooltip({
    active,
    payload,
    label
}: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null
    }

    const data = payload[0]?.payload as MonthlySpendingData & { percentageDiff?: number }

    return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
            <p className="text-white font-semibold mb-2">{label}</p>
            {payload.map((entry, index) => {
                const typedEntry = entry as unknown as CustomTooltipPayload
                const color = typedEntry.dataKey === "totalSpending" ? COLORS.blue : COLORS.gold
                const displayLabel = entry.dataKey === "totalSpending" ? "Monthly Spending" : "Burn Rate"

                return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-slate-300">{displayLabel}:</span>
                        <span className="text-white font-medium">
                            ${typedEntry.value?.toLocaleString()}
                        </span>
                    </div>
                )
            })}

            {data?.percentageDiff !== undefined && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                    <span className={`text-sm font-medium ${data.percentageDiff > 0 ? "text-red-400" : "text-green-400"
                        }`}>
                        {data.percentageDiff > 0 ? "↑" : "↓"} {Math.abs(data.percentageDiff).toFixed(1)}%
                        <span className="text-slate-400 font-normal ml-1">vs 3-month avg</span>
                    </span>
                </div>
            )}
        </div>
    )
}

export function BurnRateChart({ data, className }: BurnRateChartProps) {
    // Process data to calculate percentage differences
    const processedData = useMemo(() => {
        // Get previous 3 months data (non-current month)
        const previousMonths = data.filter(d => !d.isCurrentMonth && d.totalSpending !== undefined)
        const previousAverage = previousMonths.length > 0
            ? previousMonths.reduce((sum, d) => sum + d.totalSpending, 0) / previousMonths.length
            : 0

        return data.map(item => ({
            ...item,
            percentageDiff: previousAverage > 0
                ? (((item.cumulativeSpending || item.totalSpending) - previousAverage) / previousAverage) * 100
                : 0,
            // For bar chart, show total spending only for previous months
            barSpending: !item.isCurrentMonth ? item.totalSpending : undefined,
            // For line chart, show cumulative spending only for current month
            lineSpending: item.isCurrentMonth ? item.cumulativeSpending : undefined,
        }))
    }, [data])

    // Separate data for bars (previous months) and line (current month)
    const barData = processedData.filter(d => !d.isCurrentMonth)
    const lineData = processedData.filter(d => d.isCurrentMonth)

    // Combine for composed chart - put bar data first, then line data
    const chartData = [...barData, ...lineData]

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-200">Spending Burn Rate</h3>
                <p className="text-sm text-slate-400">
                    Previous 3 months vs current month cumulative spending
                </p>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "#475569" }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "#475569" }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => (
                            <span className="text-slate-300 text-sm">
                                {value === "barSpending" ? "Monthly Total" : "Current Month Burn Rate"}
                            </span>
                        )}
                    />

                    {/* Bar chart for previous 3 months */}
                    <Bar
                        dataKey="barSpending"
                        name="barSpending"
                        fill={COLORS.blue}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                    />

                    {/* Line chart for current month burn rate */}
                    <Line
                        type="monotone"
                        dataKey="lineSpending"
                        name="lineSpending"
                        stroke={COLORS.gold}
                        strokeWidth={3}
                        dot={{ fill: COLORS.gold, strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: COLORS.lightGold }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Legend explanation */}
            <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS.blue }}
                    />
                    <span>Previous months total spending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-1 rounded"
                        style={{ backgroundColor: COLORS.gold }}
                    />
                    <span>Current month cumulative (burn rate)</span>
                </div>
            </div>
        </div>
    )
}

// Example usage with sample data
export const sampleBurnRateData: MonthlySpendingData[] = [
    // Previous 3 months (bar chart data)
    { month: "Nov", totalSpending: 3200 },
    { month: "Dec", totalSpending: 4100 },
    { month: "Jan", totalSpending: 2800 },
    // Current month cumulative data points (line chart data)
    { month: "Feb 1", totalSpending: 0, cumulativeSpending: 450, isCurrentMonth: true, day: 1 },
    { month: "Feb 8", totalSpending: 0, cumulativeSpending: 890, isCurrentMonth: true, day: 8 },
    { month: "Feb 15", totalSpending: 0, cumulativeSpending: 1650, isCurrentMonth: true, day: 15 },
    { month: "Feb 22", totalSpending: 0, cumulativeSpending: 2100, isCurrentMonth: true, day: 22 },
    { month: "Feb 28", totalSpending: 0, cumulativeSpending: 2850, isCurrentMonth: true, day: 28 },
]
