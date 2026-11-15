// Application-wide constants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "NoteSphere"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// Sync status labels for UI
export const SYNC_STATUS_LABELS = {
    PENDING: "Not synced",
    SYNCED: "Synced",
    SYNCING: "Syncing…",
    FAILED: "Sync failed",
    CONFLICT: "Conflict",
    LOCAL_ONLY: "Local only",
} as const

// Autosave debounce delay in ms
export const AUTOSAVE_DELAY = 800

// Note document types
export const DOC_TYPES = {
    RICH_TEXT: "RICH_TEXT",
    CANVAS: "CANVAS",
    MIXED: "MIXED",
    PDF: "PDF",
} as const

// Page templates
export const PAGE_TEMPLATES = [
    { id: "blank", label: "Blank", bg: "white" },
    { id: "ruled", label: "Ruled", bg: "ruled" },
    { id: "college-ruled", label: "College Ruled", bg: "college-ruled" },
    { id: "graph", label: "Graph Paper", bg: "graph" },
    { id: "dot-grid", label: "Dot Grid", bg: "dot-grid" },
    { id: "cornell", label: "Cornell Notes", bg: "cornell" },
    { id: "daily-planner", label: "Daily Planner", bg: "daily-planner" },
    { id: "weekly-planner", label: "Weekly Planner", bg: "weekly-planner" },
    { id: "meeting-notes", label: "Meeting Notes", bg: "meeting-notes" },
    { id: "music", label: "Music Manuscript", bg: "music" },
] as const

export const NOTEBOOK_COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#3b82f6", // blue
    "#64748b", // slate
]
