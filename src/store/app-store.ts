import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SyncStatus =
    | "PENDING"
    | "SYNCING"
    | "SYNCED"
    | "FAILED"
    | "CONFLICT"
    | "LOCAL_ONLY"

export type Theme = "light" | "dark" | "system"

interface AppState {
    // UI state
    sidebarOpen: boolean
    activeNotebookId: string | null
    activeNoteId: string | null
    theme: Theme
    accentColor: string

    // Sync state
    syncStatus: SyncStatus
    isOnline: boolean
    lastSyncedAt: Date | null

    // Actions
    setSidebarOpen: (open: boolean) => void
    setActiveNotebook: (id: string | null) => void
    setActiveNote: (id: string | null) => void
    setTheme: (theme: Theme) => void
    setAccentColor: (color: string) => void
    setSyncStatus: (status: SyncStatus) => void
    setIsOnline: (online: boolean) => void
    setLastSyncedAt: (date: Date | null) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            activeNotebookId: null,
            activeNoteId: null,
            theme: "system",
            accentColor: "#6366f1",
            syncStatus: "PENDING",
            isOnline: true,
            lastSyncedAt: null,

            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setActiveNotebook: (id) => set({ activeNotebookId: id }),
            setActiveNote: (id) => set({ activeNoteId: id }),
            setTheme: (theme) => set({ theme }),
            setAccentColor: (color) => set({ accentColor: color }),
            setSyncStatus: (status) => set({ syncStatus: status }),
            setIsOnline: (online) => set({ isOnline: online }),
            setLastSyncedAt: (date) => set({ lastSyncedAt: date }),
        }),
        {
            name: "notesphere-app-state",
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                theme: state.theme,
                accentColor: state.accentColor,
                activeNotebookId: state.activeNotebookId,
            }),
        }
    )
)
