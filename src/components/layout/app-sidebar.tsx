"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BookOpen,
    Clock,
    FileText,
    Folder,
    Heart,
    Home,
    Menu,
    Pen,
    Plus,
    Search,
    Settings,
    Trash2,
    X,
} from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"
import { SyncStatusIndicator } from "@/components/sync/sync-status-indicator"
import type { Session } from "next-auth"

type User = NonNullable<Session["user"]>

const NAV_ITEMS = [
    { href: "/app/dashboard", icon: Home, label: "Dashboard" },
    { href: "/app/notes", icon: FileText, label: "All Notes" },
    { href: "/app/notebooks", icon: BookOpen, label: "Notebooks" },
    { href: "/app/folders", icon: Folder, label: "Folders" },
    { href: "/app/favorites", icon: Heart, label: "Favorites" },
    { href: "/app/recent", icon: Clock, label: "Recent" },
    { href: "/app/search", icon: Search, label: "Search" },
]

const BOTTOM_NAV = [
    { href: "/app/settings", icon: Settings, label: "Settings" },
    { href: "/app/trash", icon: Trash2, label: "Trash" },
]

export function AppSidebar({ user }: { user: User }) {
    const { sidebarOpen, setSidebarOpen } = useAppStore()
    const pathname = usePathname()

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "sidebar z-30 transition-all duration-200 ease-in-out",
                    !sidebarOpen && "collapsed",
                    "fixed lg:relative lg:flex"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                                <Pen className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold text-sm tracking-tight truncate text-[var(--foreground)]">
                                {APP_NAME}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors ml-auto"
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                {/* New Note button */}
                <div className="p-3">
                    <Link
                        href="/app/notes/new"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors w-full",
                            !sidebarOpen && "justify-center px-2"
                        )}
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        {sidebarOpen && <span>New Note</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive
                                        ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-medium"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                                    !sidebarOpen && "justify-center px-2"
                                )}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-2 space-y-0.5 border-t border-[var(--border)]">
                    {BOTTOM_NAV.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive
                                        ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-medium"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                                    !sidebarOpen && "justify-center px-2"
                                )}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}

                    {/* Sync status */}
                    {sidebarOpen && (
                        <div className="px-3 py-2">
                            <SyncStatusIndicator />
                        </div>
                    )}

                    {/* User info */}
                    {sidebarOpen && user && (
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mt-1">
                            {user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.image}
                                    alt={user.name ?? "User"}
                                    className="w-7 h-7 rounded-full shrink-0"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user.name?.[0]?.toUpperCase() ?? "U"}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-[var(--foreground)] truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)] truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
