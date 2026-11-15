"use client"

import { useAppStore } from "@/store/app-store"
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { SYNC_STATUS_LABELS } from "@/lib/constants"

export function SyncStatusIndicator() {
    const { syncStatus, isOnline, lastSyncedAt } = useAppStore()

    const icon = () => {
        if (!isOnline) return <WifiOff className="w-3.5 h-3.5" />
        switch (syncStatus) {
            case "SYNCING": return <Loader2 className="w-3.5 h-3.5 animate-spin" />
            case "SYNCED": return <CheckCircle2 className="w-3.5 h-3.5" />
            case "FAILED": return <AlertCircle className="w-3.5 h-3.5" />
            case "CONFLICT": return <AlertCircle className="w-3.5 h-3.5" />
            default: return <Cloud className="w-3.5 h-3.5" />
        }
    }

    const colorClass = () => {
        if (!isOnline) return "text-slate-400"
        switch (syncStatus) {
            case "SYNCING": return "text-indigo-500"
            case "SYNCED": return "text-green-500"
            case "FAILED": return "text-red-500"
            case "CONFLICT": return "text-orange-500"
            default: return "text-[var(--muted-foreground)]"
        }
    }

    const label = !isOnline ? "Offline" : SYNC_STATUS_LABELS[syncStatus] ?? syncStatus

    return (
        <div className={cn("flex items-center gap-1.5 text-xs", colorClass())}>
            {icon()}
            <span className="truncate">{label}</span>
        </div>
    )
}

export function SyncStatusBadge() {
    const { syncStatus, isOnline } = useAppStore()

    if (!isOnline) {
        return (
            <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
            </div>
        )
    }

    if (syncStatus === "SYNCING") {
        return (
            <div className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Syncing…</span>
            </div>
        )
    }

    if (syncStatus === "SYNCED") {
        return (
            <div className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Synced</span>
            </div>
        )
    }

    if (syncStatus === "FAILED") {
        return (
            <div className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" />
                <span>Sync failed</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-1 rounded-full">
            <CloudOff className="w-3 h-3" />
            <span>Not synced</span>
        </div>
    )
}
