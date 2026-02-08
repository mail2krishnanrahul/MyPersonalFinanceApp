"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DateRangeProvider, useDateRange } from "@/contexts/date-range-context"
import { DateRangePicker } from "@/components/date-range-picker"
import { Separator } from "@/components/ui/separator"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { usePathname } from "next/navigation"

function HeaderWithDatePicker() {
    const { dateRange, setDateRange } = useDateRange()

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />
        </header>
    )
}

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <AuthProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
        </AuthProvider>
    )
}

function MainLayoutContent({ children }: MainLayoutProps) {
    const pathname = usePathname()
    const isAuthPage = pathname === '/login' || pathname === '/register'

    if (isAuthPage) {
        return <>{children}</>
    }

    return (
        <ProtectedRoute>
            <DateRangeProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <HeaderWithDatePicker />
                        <main className="flex-1 overflow-auto p-6">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </DateRangeProvider>
        </ProtectedRoute>
    )
}
