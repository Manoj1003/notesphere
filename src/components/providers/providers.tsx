"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { OnlineStatusProvider } from "@/components/providers/online-status-provider"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 2,
                    },
                },
            })
    )

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <OnlineStatusProvider>
                        {children}
                        <Toaster />
                    </OnlineStatusProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}
