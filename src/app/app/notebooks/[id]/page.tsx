"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, FileText, Plus, Loader2, Star, AlertCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { useCreateNote } from "@/hooks/use-notes"
import { Button } from "@/components/ui/button"

interface NotebookDetail {
    id: string
    title: string
    color: string
    description: string | null
    isPinned: boolean
    _count?: { notes: number }
    notes: {
        id: string
        title: string
        updatedAt: string
        syncStatus: string
        docType: string
        isPinned: boolean
    }[]
}

async function fetchNotebook(id: string): Promise<NotebookDetail> {
    const res = await fetch(`/api/notebooks/${id}`)
    if (!res.ok) throw new Error("Not found")
    return res.json()
}

export default function NotebookDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { data: nb, isLoading, error } = useQuery({
        queryKey: ["notebook", id],
        queryFn: () => fetchNotebook(id),
    })
    const createNote = useCreateNote()

    const handleCreateNote = async () => {
        const note = await createNote.mutateAsync({ title: "Untitled", notebookId: id })
        router.push(`/app/notes/${note.id}`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
        )
    }

    if (error || !nb) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-[var(--muted-foreground)]">Notebook not found.</p>
                <Link href="/app/notebooks" className={buttonVariants({ variant: "outline" })}>
                    <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/app/notebooks"
                    className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${nb.color}33` }}>
                    <FileText className="w-4.5 h-4.5" style={{ color: nb.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[var(--foreground)] truncate">{nb.title}</h1>
                        {nb.isPinned && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    {nb.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{nb.description}</p>
                    )}
                </div>
                <Button size="sm" onClick={handleCreateNote} disabled={createNote.isPending}>
                    {createNote.isPending
                        ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                    New Note
                </Button>
            </div>

            {/* Notes */}
            {nb.notes.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-[var(--border)]">
                    <FileText className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--muted-foreground)]">This notebook is empty.</p>
                    <Button size="sm" className="mt-4" onClick={handleCreateNote}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />New Note
                    </Button>
                </div>
            ) : (
                <div className="space-y-1">
                    {nb.notes.map((note) => (
                        <Link key={note.id} href={`/app/notes/${note.id}`}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                        >
                            <FileText className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                    {note.title || "Untitled"}
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)]">{note.docType}</p>
                            </div>
                            {note.isPinned && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
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
