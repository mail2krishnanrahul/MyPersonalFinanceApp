"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"

interface DateRangeContextType {
    dateRange: DateRange | undefined
    setDateRange: (range: DateRange | undefined) => void
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined)

export function useDateRange() {
    const context = useContext(DateRangeContext)
    if (!context) {
        throw new Error("useDateRange must be used within a DateRangeProvider")
    }
    return context
}

interface DateRangeProviderProps {
    children: React.ReactNode
}

export function DateRangeProvider({ children }: DateRangeProviderProps) {
    // Default to last 30 days
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })

    return (
        <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
            {children}
        </DateRangeContext.Provider>
    )
}
