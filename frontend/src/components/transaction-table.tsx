"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Coffee,
    Zap,
    Car,
    Shield,
    ShoppingCart,
    Utensils,
    Home,
    Smartphone,
    Plane,
    Film,
    Heart,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { format } from "date-fns"

// Transaction data interface
export interface Transaction {
    id: string
    rawDescription: string
    cleanDescription: string | null
    category: string | null
    amount: number
    transactionDate: string
    status: "Raw" | "Cleaned" | "Flagged"
}

// Paginated response from backend
export interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
    Dining: Coffee,
    Utilities: Zap,
    Transportation: Car,
    Transport: Car,
    Insurance: Shield,
    Shopping: ShoppingCart,
    Groceries: Utensils,
    Home: Home,
    Electronics: Smartphone,
    Travel: Plane,
    Entertainment: Film,
    Healthcare: Heart,
    Gas: Car,
}

// Get icon for category
function getCategoryIcon(category: string | null): React.ElementType {
    if (!category) return HelpCircle
    return categoryIcons[category] || HelpCircle
}

// Status badge variant
function getStatusBadge(status: string) {
    switch (status) {
        case "Cleaned":
            return <Badge className="bg-green-500 hover:bg-green-600">Cleaned</Badge>
        case "Flagged":
            return <Badge className="bg-amber-500 hover:bg-amber-600">Flagged</Badge>
        case "Raw":
        default:
            return <Badge className="bg-red-500 hover:bg-red-600">Raw</Badge>
    }
}

// Categories for filtering
const CATEGORIES = [
    "All",
    "Dining",
    "Utilities",
    "Transportation",
    "Insurance",
    "Shopping",
    "Groceries",
    "Entertainment",
    "Travel",
    "Healthcare",
    "Gas",
    "Home",
    "Electronics",
]

interface TransactionTableProps {
    apiBaseUrl?: string
}

export function TransactionTable({ apiBaseUrl = "http://localhost:8080" }: TransactionTableProps) {
    // State
    const [data, setData] = useState<Transaction[]>([])
    const [totalRows, setTotalRows] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState<string>("All")

    // Pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    // Fetch transactions from API
    const fetchTransactions = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.pageIndex.toString(),
                size: pagination.pageSize.toString(),
            })

            if (categoryFilter && categoryFilter !== "All") {
                params.append("category", categoryFilter)
            }

            const response = await fetch(`${apiBaseUrl}/api/transactions?${params}`)

            if (!response.ok) {
                throw new Error("Failed to fetch transactions")
            }

            const result: PaginatedResponse<Transaction> = await response.json()

            // Map transactions and determine status
            const mappedData = result.content.map((t) => ({
                ...t,
                status: determineStatus(t) as "Raw" | "Cleaned" | "Flagged",
            }))

            setData(mappedData)
            setTotalRows(result.totalElements)
            setTotalPages(result.totalPages)
        } catch (error) {
            console.error("Error fetching transactions:", error)
            // Use sample data for demo purposes
            setData(sampleTransactions)
            setTotalRows(sampleTransactions.length)
            setTotalPages(1)
        } finally {
            setIsLoading(false)
        }
    }

    // Determine transaction status
    const determineStatus = (transaction: Transaction): string => {
        if (transaction.cleanDescription && transaction.category) {
            return "Cleaned"
        }
        // Check for flagged patterns (unusual amounts, etc.)
        if (Math.abs(transaction.amount) > 1000) {
            return "Flagged"
        }
        return "Raw"
    }

    // Effect to fetch data when pagination or filter changes
    useEffect(() => {
        fetchTransactions()
    }, [pagination.pageIndex, pagination.pageSize, categoryFilter])

    // Column definitions
    const columns: ColumnDef<Transaction>[] = useMemo(
        () => [
            {
                accessorKey: "transactionDate",
                header: "Date",
                cell: ({ row }) => {
                    const date = new Date(row.getValue("transactionDate"))
                    return <span className="text-sm">{format(date, "MMM d, yyyy")}</span>
                },
            },
            {
                accessorKey: "rawDescription",
                header: "Description",
                cell: ({ row }) => {
                    const raw = row.original.rawDescription
                    const clean = row.original.cleanDescription
                    return (
                        <div>
                            <p className="font-medium text-sm">{clean || raw}</p>
                            {clean && (
                                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                                    {raw}
                                </p>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }) => {
                    const category = row.getValue("category") as string | null
                    const Icon = getCategoryIcon(category)
                    return (
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{category || "Uncategorized"}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "amount",
                header: () => <div className="text-right">Amount</div>,
                cell: ({ row }) => {
                    const amount = parseFloat(row.getValue("amount"))
                    const formatted = new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(amount)
                    return (
                        <div
                            className={`text-right font-medium ${amount < 0 ? "text-red-500" : "text-green-500"
                                }`}
                        >
                            {formatted}
                        </div>
                    )
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => getStatusBadge(row.getValue("status")),
            },
        ],
        []
    )

    // TanStack Table instance
    const table = useReactTable({
        data,
        columns,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Category:</span>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    {totalRows} total transactions
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Rows per page</p>
                    <Select
                        value={pagination.pageSize.toString()}
                        onValueChange={(value) =>
                            setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
                        }
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 30, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.pageIndex + 1} of {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.setPageIndex(totalPages - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Sample data for demo/fallback
const sampleTransactions: Transaction[] = [
    {
        id: "1",
        rawDescription: "VZW*WEBSITE PMT 12345",
        cleanDescription: "Verizon Wireless Payment",
        category: "Utilities",
        amount: -89.99,
        transactionDate: "2026-02-08T10:30:00",
        status: "Cleaned",
    },
    {
        id: "2",
        rawDescription: "AMZN MKTP US*2K4H91JF0",
        cleanDescription: null,
        category: null,
        amount: -45.67,
        transactionDate: "2026-02-07T14:22:00",
        status: "Raw",
    },
    {
        id: "3",
        rawDescription: "7-ELEVEN 00423",
        cleanDescription: "7-Eleven Convenience Store",
        category: "Dining",
        amount: -12.50,
        transactionDate: "2026-02-06T08:15:00",
        status: "Cleaned",
    },
    {
        id: "4",
        rawDescription: "SHELL OIL 57442136",
        cleanDescription: "Shell Gas Station",
        category: "Gas",
        amount: -58.23,
        transactionDate: "2026-02-05T16:45:00",
        status: "Cleaned",
    },
    {
        id: "5",
        rawDescription: "WIRE TRANSFER OFFSHORE",
        cleanDescription: null,
        category: null,
        amount: -2500.00,
        transactionDate: "2026-02-04T09:00:00",
        status: "Flagged",
    },
]
