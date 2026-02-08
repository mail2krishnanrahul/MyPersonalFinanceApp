"use client"

import { TransactionTable } from "@/components/transaction-table"

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">
                    View and manage your transactions
                </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow">
                <TransactionTable />
            </div>
        </div>
    )
}
