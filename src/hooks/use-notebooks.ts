"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateNotebookInput, UpdateNotebookInput } from "@/lib/schemas"

export interface NotebookSummary {
    id: string
    title: string
    color: string
    description: string | null
    isPinned: boolean
    isFavorite: boolean
    isArchived: boolean
    deletedAt: string | null
    updatedAt: string
    folder: { id: string; name: string } | null
    _count: { notes: number }
}

async function fetchNotebooks(archived = false): Promise<NotebookSummary[]> {
    const res = await fetch(`/api/notebooks?archived=${archived}`)
    if (!res.ok) throw new Error("Failed to fetch notebooks")
    return res.json()
}

export function useNotebooks(archived = false) {
    return useQuery({
        queryKey: ["notebooks", { archived }],
        queryFn: () => fetchNotebooks(archived),
    })
}

export function useCreateNotebook() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (data: CreateNotebookInput) => {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to create notebook")
            return res.json()
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notebooks"] }),
    })
}

export function useUpdateNotebook() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateNotebookInput }) => {
            const res = await fetch(`/api/notebooks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update notebook")
            return res.json()
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notebooks"] }),
    })
}

export function useDeleteNotebook() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/notebooks/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete notebook")
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notebooks"] }),
    })
}
