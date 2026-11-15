"use client"

import { signOut } from "next-auth/react"
import { Bell, ChevronDown, LogOut, Menu, Moon, Settings, Sun } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { Session } from "next-auth"

type User = NonNullable<Session["user"]>

export function AppTopBar({ user }: { user: User }) {
    const { setSidebarOpen, theme, setTheme } = useAppStore()
    const [menuOpen, setMenuOpen] = useState(false)

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)] shrink-0 h-14">
            {/* Left side — mobile menu toggle */}
            <button
                className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            {/* Right controls */}
            <div className="flex items-center gap-1">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications (placeholder) */}
                <button
                    className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                    aria-label="Notifications"
                >
                    <Bell className="w-4 h-4" />
                </button>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                        {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.image}
                                alt={user.name ?? "User"}
                                className="w-7 h-7 rounded-full"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {user.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                        )}
                        <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block max-w-[140px] truncate">
                            {user.name}
                        </span>
                        <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                        <div
                            className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 py-1 animate-fade-in"
                            onBlur={() => setMenuOpen(false)}
                        >
                            <div className="px-3 py-2 border-b border-[var(--border)]">
                                <p className="text-xs font-medium text-[var(--foreground)] truncate">{user.name}</p>
                                <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                            </div>
                            <a
                                href="/app/settings"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </a>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm w-full text-left",
                                    "text-red-500 hover:bg-red-500/10 transition-colors"
                                )}
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
