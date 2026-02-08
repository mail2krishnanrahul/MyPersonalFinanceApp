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

    const data = payload[0]?.payload as MonthlySpendingData & { percentageDiff?: number; trendValue?: number }

    return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
            <p className="text-white font-semibold mb-2">{label}</p>
            {payload.map((entry, index) => {
                const typedEntry = entry as unknown as CustomTooltipPayload
                const isBar = typedEntry.dataKey === "barSpending" || typedEntry.dataKey === "totalSpending"
                const color = isBar ? COLORS.blue : COLORS.gold
                const displayLabel = isBar ? "Burn Rate" : "Trend"

                if (typedEntry.value === undefined || typedEntry.value === null) return null

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
                        <span className="text-slate-400 font-normal ml-1">vs average</span>
                    </span>
                </div>
            )}
        </div>
    )
}

export function BurnRateChart({ data, className }: BurnRateChartProps) {
    // Process data to calculate percentage differences and add trend line
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return []

        // Calculate average spending across all months
        const allSpending = data.map(d => d.cumulativeSpending || d.totalSpending || 0)
        const average = allSpending.length > 0
            ? allSpending.reduce((sum, v) => sum + v, 0) / allSpending.length
            : 0

        return data.map(item => {
            const spending = item.cumulativeSpending || item.totalSpending || 0
            return {
                ...item,
                // Bar shows monthly spending
                barSpending: spending,
                // Trend line connects all points
                trendValue: spending,
                // Calculate % difference from average
                percentageDiff: average > 0
                    ? ((spending - average) / average) * 100
                    : 0,
            }
        })
    }, [data])

    if (processedData.length === 0) {
        return (
            <div className={`w-full ${className}`}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-200">Spending Burn Rate</h3>
                    <p className="text-sm text-slate-400">No data available for selected date range</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-200">Spending Burn Rate</h3>
                <p className="text-sm text-slate-400">
                    Monthly spending with trend line
                </p>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                    data={processedData}
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
                                {value === "barSpending" ? "Monthly Spending" : "Spending Trend"}
                            </span>
                        )}
                    />

                    {/* Bar chart for monthly spending */}
                    <Bar
                        dataKey="barSpending"
                        name="barSpending"
                        fill={COLORS.blue}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                    />

                    {/* Line chart connecting all months for trend */}
                    <Line
                        type="monotone"
                        dataKey="trendValue"
                        name="trendValue"
                        stroke={COLORS.gold}
                        strokeWidth={3}
                        dot={{
                            fill: COLORS.gold,
                            stroke: COLORS.gold,
                            strokeWidth: 2,
                            r: 5,
                        }}
                        activeDot={{
                            fill: COLORS.lightGold,
                            stroke: COLORS.gold,
                            strokeWidth: 2,
                            r: 7,
                        }}
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Legend description */}
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.blue }} />
                    <span>Monthly total spending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5" style={{ backgroundColor: COLORS.gold }} />
                    <span>Spending trend line</span>
                </div>
            </div>
        </div>
    )
}
