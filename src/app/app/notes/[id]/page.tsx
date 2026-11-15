"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { formatDistanceToNow } from "date-fns"
import {
    ArrowLeft, Star, StarOff, MoreHorizontal, Trash2,
    Archive, BookOpen, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { useAutosave } from "@/hooks/use-autosave"
import { useNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function SaveStatusBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
    if (status === "idle") return null
    return (
        <span className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
            status === "saving" && "text-[var(--muted-foreground)]",
            status === "saved" && "text-emerald-600 dark:text-emerald-400",
            status === "error" && "text-red-500",
        )}>
            {status === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
            {status === "saved" && <CheckCircle2 className="w-3 h-3" />}
            {status === "error" && <AlertCircle className="w-3 h-3" />}
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save error"}
        </span>
    )
}

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const { data: note, isLoading, error } = useNote(id)
    const updateNote = useUpdateNote()
    const deleteNote = useDeleteNote()

    const [localTitle, setLocalTitle] = useState<string | null>(null)
    const [localContent, setLocalContent] = useState<object | null>(null)

    const title = localTitle ?? note?.title ?? ""
    const content = localContent ?? note?.content ?? null

    // Autosave
    const { status: saveStatus } = useAutosave({
        noteId: id,
        content,
        title,
    })

    const handleContentChange = useCallback((json: object) => {
        setLocalContent(json)
    }, [])

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value)
    }

    const handleToggleFavorite = async () => {
        if (!note) return
        await updateNote.mutateAsync({ id, data: { isFavorite: !note.isFavorite } })
    }

    const handleDelete = async () => {
        if (!confirm("Move this note to trash?")) return
        await deleteNote.mutateAsync(id)
        router.push("/app/dashboard")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
        )
    }

    if (error || !note) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="text-[var(--muted-foreground)]">Note not found.</p>
                <Link href="/app/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
                    <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
                <Link href="/app/dashboard" className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>

                {note.notebook && (
                    <Link href={`/app/notebooks/${note.notebook.id}`}
                        className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ background: note.notebook.color }} />
                        {note.notebook.title}
                    </Link>
                )}

                <Input
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Note title…"
                    className="flex-1 border-0 shadow-none text-lg font-semibold bg-transparent px-0 py-0 h-auto focus-visible:ring-0 placeholder:text-[var(--muted-foreground)]"
                />

                <div className="flex items-center gap-1 shrink-0">
                    <SaveStatusBadge status={saveStatus} />

                    <button
                        title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        onClick={handleToggleFavorite}
                        className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    >
                        {note.isFavorite
                            ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            : <StarOff className="w-4 h-4 text-[var(--muted-foreground)]" />
                        }
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <button className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {note.notebook && (
                                <DropdownMenuItem onClick={() => router.push(`/app/notebooks/${note.notebook!.id}`)}>
                                    <BookOpen className="w-3.5 h-3.5 mr-2" />Open Notebook
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => updateNote.mutateAsync({ id, data: { isArchived: !note.isArchived } })}>
                                <Archive className="w-3.5 h-3.5 mr-2" />
                                {note.isArchived ? "Unarchive" : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" />Move to Trash
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <RichTextEditor
                    content={content ?? undefined}
                    onUpdate={handleContentChange}
                    placeholder="Start writing… (Markdown shortcuts work)"
                    className="h-full px-8 py-6"
                />
            </div>

            {/* Meta footer */}
            <div className="px-6 py-2 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--muted-foreground)] shrink-0">
                <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                <span>·</span>
                <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                {note.versions.length > 0 && (
                    <>
                        <span>·</span>
                        <span>{note.versions.length} revision{note.versions.length !== 1 ? "s" : ""}</span>
                    </>
                )}
            </div>
        </div>
    )
}
