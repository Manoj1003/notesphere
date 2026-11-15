"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/app-store"

export function OnlineStatusProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const setIsOnline = useAppStore((s) => s.setIsOnline)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // Set initial value
        setIsOnline(navigator.onLine)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [setIsOnline])

    return <>{children}</>
}
