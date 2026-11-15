"use client"

import { useEffect } from "react"
import { useAppStore } from "@/store/app-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppStore((s) => s.theme)
    const accentColor = useAppStore((s) => s.accentColor)

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            root.classList.add(systemDark ? "dark" : "light")
        } else {
            root.classList.add(theme)
        }

        // Set CSS variable for accent color
        root.style.setProperty("--accent-color", accentColor)
    }, [theme, accentColor])

    return <>{children}</>
}
