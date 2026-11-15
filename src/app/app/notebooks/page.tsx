"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { BookOpen, Plus, Loader2, MoreHorizontal, Trash2, Archive, Star } from "lucide-react"
import { useNotebooks, useCreateNotebook, useDeleteNotebook, useUpdateNotebook } from "@/hooks/use-notebooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NOTEBOOK_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981",
    "#3b82f6", "#f59e0b", "#14b8a6", "#ef4444", "#84cc16",
]

export default function NotebooksPage() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [color, setColor] = useState(NOTEBOOK_COLORS[0])
    const { data, isLoading } = useNotebooks()
    const createNb = useCreateNotebook()
    const deleteNb = useDeleteNotebook()
    const updateNb = useUpdateNotebook()
    const notebooks = data ?? []

    const handleCreate = async () => {
        if (!title.trim()) return
        await createNb.mutateAsync({ title: title.trim(), color })
        setTitle("")
        setColor(NOTEBOOK_COLORS[0])
        setOpen(false)
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Notebooks</h1>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />New Notebook
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-xl bg-[var(--muted)] animate-pulse" />
                    ))}
                </div>
            ) : notebooks.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-[var(--border)]">
                    <BookOpen className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--muted-foreground)]">No notebooks yet.</p>
                    <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />New Notebook
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notebooks.map((nb) => (
                        <div key={nb.id} className="group relative flex flex-col gap-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => router.push(`/app/notebooks/${nb.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${nb.color}33` }}>
                                    <BookOpen className="w-4.5 h-4.5" style={{ color: nb.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[var(--foreground)] truncate">{nb.title}</p>
                                    {nb.description && (
                                        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{nb.description}</p>
                                    )}
                                </div>
                                {nb.isPinned && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                            </div>
                            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                                <span>{nb._count.notes} note{nb._count.notes !== 1 ? "s" : ""}</span>
                                <span>{formatDistanceToNow(new Date(nb.updatedAt), { addSuffix: true })}</span>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                                    <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-all">
                                        <MoreHorizontal className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={() => updateNb.mutateAsync({ id: nb.id, data: { isPinned: !nb.isPinned } })}>
                                        <Star className="w-3.5 h-3.5 mr-2" />{nb.isPinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateNb.mutateAsync({ id: nb.id, data: { isArchived: !nb.isArchived } })}>
                                        <Archive className="w-3.5 h-3.5 mr-2" />{nb.isArchived ? "Unarchive" : "Archive"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive"
                                        onClick={() => { if (confirm("Delete notebook?")) deleteNb.mutate(nb.id) }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Notebook</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nb-title">Title</Label>
                            <Input id="nb-title" placeholder="My Notebook" value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Color</Label>
                            <div className="flex gap-2 flex-wrap">
                                {NOTEBOOK_COLORS.map((c) => (
                                    <button key={c} type="button" onClick={() => setColor(c)}
                                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                                        style={{ background: c, outline: color === c ? `2px solid ${c}` : undefined, outlineOffset: "2px" }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createNb.isPending || !title.trim()}>
                            {createNb.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
