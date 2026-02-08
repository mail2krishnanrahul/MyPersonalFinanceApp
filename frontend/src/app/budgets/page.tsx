"use client"

import { useDateRange } from "@/contexts/date-range-context"
import { format } from "date-fns"

export default function BudgetsPage() {
    const { dateRange } = useDateRange()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
                <p className="text-muted-foreground">
                    Manage your spending limits
                    {dateRange?.from && dateRange?.to && (
                        <span className="ml-2">
                            ({format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")})
                        </span>
                    )}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Groceries</h3>
                        <span className="text-sm text-muted-foreground">$350 / $500</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">$150 remaining</p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Dining</h3>
                        <span className="text-sm text-muted-foreground">$180 / $200</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">$20 remaining</p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Entertainment</h3>
                        <span className="text-sm text-muted-foreground">$175 / $150</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    <p className="text-sm text-red-600 mt-2">$25 over budget</p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Transportation</h3>
                        <span className="text-sm text-muted-foreground">$120 / $300</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">$180 remaining</p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Shopping</h3>
                        <span className="text-sm text-muted-foreground">$280 / $400</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">$120 remaining</p>
                </div>

                <div className="rounded-xl border border-dashed bg-muted/20 p-6 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors">
                    <div className="text-center">
                        <p className="text-2xl text-muted-foreground">+</p>
                        <p className="text-sm text-muted-foreground">Add Budget</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
