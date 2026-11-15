"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateNoteInput, UpdateNoteInput } from "@/lib/schemas"

export interface NoteSummary {
    id: string
    title: string
    docType: string
    isFavorite: boolean
    isPinned: boolean
    isArchived: boolean
    syncStatus: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    notebookId: string | null
    notebook?: { id: string; title: string; color: string } | null
}

export interface NoteDetail extends NoteSummary {
    content: object
    tags: { tag: { id: string; name: string; color: string } }[]
    versions: { id: string; createdAt: string; contentHash: string }[]
}

export interface NotesResponse {
    notes: NoteSummary[]
    nextCursor: string | null
    hasMore: boolean
}

async function fetchNotes(params: {
    q?: string
    notebookId?: string
    filter?: string
    limit?: number
}): Promise<NotesResponse> {
    const sp = new URLSearchParams()
    if (params.q) sp.set("q", params.q)
    if (params.notebookId) sp.set("notebookId", params.notebookId)
    if (params.filter) sp.set("filter", params.filter)
    if (params.limit) sp.set("limit", String(params.limit))

    const res = await fetch(`/api/notes?${sp.toString()}`)
    if (!res.ok) throw new Error("Failed to fetch notes")
    return res.json()
}

async function fetchNote(id: string): Promise<NoteDetail> {
    const res = await fetch(`/api/notes/${id}`)
    if (!res.ok) throw new Error("Failed to fetch note")
    return res.json()
}

export function useNotes(params: { q?: string; notebookId?: string; filter?: string; limit?: number } = {}) {
    return useQuery({
        queryKey: ["notes", params],
        queryFn: () => fetchNotes(params),
    })
}

export function useNote(id: string | null) {
    return useQuery({
        queryKey: ["note", id],
        queryFn: () => fetchNote(id!),
        enabled: !!id,
    })
}

export function useCreateNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (data: CreateNoteInput) => {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to create note")
            return res.json() as Promise<NoteDetail>
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    })
}

export function useUpdateNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateNoteInput }) => {
            const res = await fetch(`/api/notes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update note")
            return res.json() as Promise<NoteDetail>
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["note", vars.id] })
            qc.invalidateQueries({ queryKey: ["notes"] })
        },
    })
}

export function useDeleteNote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete note")
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
    })
}
