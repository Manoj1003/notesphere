"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
    BookOpen, FileText, Heart, Clock, Plus, Loader2,
    Star, MoreHorizontal, Trash2, Archive, Pencil,
} from "lucide-react"
import { useNotebooks, useCreateNotebook, useDeleteNotebook } from "@/hooks/use-notebooks"
import { useNotes, useCreateNote } from "@/hooks/use-notes"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const NOTEBOOK_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981",
    "#3b82f6", "#f59e0b", "#14b8a6", "#ef4444", "#84cc16",
]

function StatCard({ icon: Icon, label, value, href, color }: {
    icon: React.ElementType; label: string; value: number; href: string; color: string
}) {
    return (
        <Link href={href}
            className="group p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <span className="text-2xl font-bold text-[var(--foreground)]">{value}</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{label}</p>
        </Link>
    )
}

function NoteCard({ note, onDelete }: { note: { id: string; title: string; updatedAt: string; notebook?: { color: string; title: string } | null }; onDelete: (id: string) => void }) {
    return (
        <div className="group relative flex flex-col gap-1 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/40 hover:shadow-md transition-all">
            {note.notebook && (
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: note.notebook.color }} />
                    <span className="text-xs text-[var(--muted-foreground)] truncate">{note.notebook.title}</span>
                </div>
            )}
            <Link href={`/app/notes/${note.id}`} className="font-medium text-[var(--foreground)] truncate pr-8 text-sm">
                {note.title || "Untitled"}
            </Link>
            <p className="text-xs text-[var(--muted-foreground)]">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--muted)] transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild>
                        <Link href={`/app/notes/${note.id}`}><Pencil className="w-3.5 h-3.5 mr-2" />Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(note.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter()
    const [newNbOpen, setNewNbOpen] = useState(false)
    const [nbTitle, setNbTitle] = useState("")
    const [nbColor, setNbColor] = useState(NOTEBOOK_COLORS[0])

    const { data: nbData, isLoading: nbLoading } = useNotebooks()
    const { data: recentData, isLoading: recentLoading } = useNotes({ limit: 8 })
    const { data: favoriteData } = useNotes({ filter: "favorites", limit: 4 })
    const createNb = useCreateNotebook()
    const deleteNb = useDeleteNotebook()
    const createNote = useCreateNote()

    const notebooks = nbData ?? []
    const recentNotes = recentData?.notes ?? []
    const favoriteNotes = favoriteData?.notes ?? []

    const handleCreateNote = async () => {
        const note = await createNote.mutateAsync({ title: "Untitled" })
        router.push(`/app/notes/${note.id}`)
    }

    const handleCreateNotebook = async () => {
        if (!nbTitle.trim()) return
        await createNb.mutateAsync({ title: nbTitle.trim(), color: nbColor })
        setNbTitle("")
        setNbColor(NOTEBOOK_COLORS[0])
        setNewNbOpen(false)
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
                    <p className="text-[var(--muted-foreground)] text-sm mt-0.5">Your notes, at a glance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setNewNbOpen(true)}>
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />New Notebook
                    </Button>
                    <Button size="sm" onClick={handleCreateNote} disabled={createNote.isPending}>
                        {createNote.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                        New Note
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="All Notes" value={recentData?.notes.length ?? 0} href="/app/notes" color="#6366f1" />
                <StatCard icon={BookOpen} label="Notebooks" value={notebooks.length} href="/app/notebooks" color="#8b5cf6" />
                <StatCard icon={Heart} label="Favorites" value={favoriteNotes.length} href="/app/favorites" color="#ec4899" />
                <StatCard icon={Clock} label="Recent" value={recentNotes.length} href="/app/recent" color="#f97316" />
            </div>

            {/* Recent Notes */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-[var(--foreground)]">Recent Notes</h2>
                    <Link href="/app/notes" className="text-xs text-indigo-500 hover:underline">View all →</Link>
                </div>
                {recentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 rounded-xl bg-[var(--muted)] animate-pulse" />
                        ))}
                    </div>
                ) : recentNotes.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-[var(--border)]">
                        <FileText className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--muted-foreground)]">No notes yet. Create your first note!</p>
                        <Button size="sm" className="mt-4" onClick={handleCreateNote}>
                            <Plus className="w-3.5 h-3.5 mr-1.5" />New Note
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {recentNotes.map((note) => (
                            <NoteCard key={note.id} note={note} onDelete={(id) => {/* handled below */ }} />
                        ))}
                    </div>
                )}
            </section>

            {/* Notebooks */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-[var(--foreground)]">Notebooks</h2>
                    <Link href="/app/notebooks" className="text-xs text-indigo-500 hover:underline">View all →</Link>
                </div>
                {nbLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-[var(--muted)] animate-pulse" />
                        ))}
                    </div>
                ) : notebooks.length === 0 ? (
                    <div className="text-center py-10 rounded-xl border border-dashed border-[var(--border)]">
                        <BookOpen className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--muted-foreground)]">No notebooks yet.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setNewNbOpen(true)}>
                            <Plus className="w-3.5 h-3.5 mr-1.5" />New Notebook
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {notebooks.slice(0, 6).map((nb) => (
                            <Link key={nb.id} href={`/app/notebooks/${nb.id}`}
                                className="group flex flex-col gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/40 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${nb.color}33` }}>
                                        <BookOpen className="w-4 h-4" style={{ color: nb.color }} />
                                    </div>
                                    <span className="font-medium text-sm text-[var(--foreground)] truncate">{nb.title}</span>
                                    {nb.isPinned && <Star className="w-3 h-3 text-amber-400 ml-auto shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        {nb._count.notes} note{nb._count.notes !== 1 ? "s" : ""}
                                    </span>
                                    {nb.folder && (
                                        <span className="text-xs text-[var(--muted-foreground)] truncate">
                                            {nb.folder.name}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* New Notebook Dialog */}
            <Dialog open={newNbOpen} onOpenChange={setNewNbOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Notebook</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nb-title">Title</Label>
                            <Input
                                id="nb-title"
                                placeholder="My Notebook"
                                value={nbTitle}
                                onChange={(e) => setNbTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateNotebook()}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Color</Label>
                            <div className="flex gap-2 flex-wrap">
                                {NOTEBOOK_COLORS.map((c) => (
                                    <button key={c} type="button"
                                        onClick={() => setNbColor(c)}
                                        className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        style={{
                                            background: c,
                                            outline: nbColor === c ? `2px solid ${c}` : undefined,
                                            outlineOffset: nbColor === c ? "2px" : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewNbOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateNotebook} disabled={createNb.isPending || !nbTitle.trim()}>
                            {createNb.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
