"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { FileText, Plus, Loader2, Search, Filter } from "lucide-react"
import { useNotes, useCreateNote } from "@/hooks/use-notes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Filter = "all" | "favorites" | "pinned"

export default function NotesPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<Filter>("all")
    const createNote = useCreateNote()

    const { data, isLoading } = useNotes({
        q: search || undefined,
        filter: filter === "all" ? undefined : filter,
    })
    const notes = data?.notes ?? []

    const handleCreate = async () => {
        const note = await createNote.mutateAsync({ title: "Untitled" })
        router.push(`/app/notes/${note.id}`)
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">All Notes</h1>
                <Button size="sm" onClick={handleCreate} disabled={createNote.isPending}>
                    {createNote.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                    New Note
                </Button>
            </div>

            {/* Search + filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <Input
                        placeholder="Search notes…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-sm">
                    {(["all", "favorites", "pinned"] as const).map((f) => (
                        <button key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-2 capitalize transition-colors",
                                filter === f
                                    ? "bg-indigo-600 text-white"
                                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes list */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-[var(--muted)] animate-pulse" />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-[var(--border)]">
                    <FileText className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {search ? `No notes matching "${search}"` : "No notes yet."}
                    </p>
                    {!search && (
                        <Button size="sm" className="mt-4" onClick={handleCreate}>
                            <Plus className="w-3.5 h-3.5 mr-1.5" />New Note
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-1">
                    {notes.map((note) => (
                        <Link key={note.id} href={`/app/notes/${note.id}`}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                        >
                            <FileText className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                    {note.title || "Untitled"}
                                </p>
                                {note.notebook && (
                                    <p className="text-xs text-[var(--muted-foreground)] truncate flex items-center gap-1">
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                                            style={{ background: note.notebook.color }}
                                        />
                                        {note.notebook.title}
                                    </p>
                                )}
                            </div>
                            <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
