"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseAutosaveOptions {
    noteId: string | null
    content: object | null
    title: string
    debounceMs?: number
    onStatusChange?: (status: SaveStatus) => void
}

/**
 * Autosave hook: debounces content/title changes and PATCHes /api/notes/[id].
 * Tracks a save-status string so the UI can show Saving… / Saved / Error.
 */
export function useAutosave({
    noteId,
    content,
    title,
    debounceMs = 800,
    onStatusChange,
}: UseAutosaveOptions) {
    const [status, setStatus] = useState<SaveStatus>("idle")
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    const updateStatus = useCallback((s: SaveStatus) => {
        setStatus(s)
        onStatusChange?.(s)
    }, [onStatusChange])

    const save = useCallback(async (body: { content: object; title: string }) => {
        if (!noteId) return

        // Cancel pending in-flight request
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        updateStatus("saving")

        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: abortRef.current.signal,
            })

            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            updateStatus("saved")

            // Reset to idle after 2s
            setTimeout(() => setStatus((prev) => (prev === "saved" ? "idle" : prev)), 2000)
        } catch (err) {
            if ((err as Error).name === "AbortError") return
            console.error("[useAutosave] save failed", err)
            updateStatus("error")
        }
    }, [noteId, updateStatus])

    useEffect(() => {
        if (!noteId || content === null) return

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            void save({ content, title })
        }, debounceMs)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, title, noteId, debounceMs])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort()
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return { status }
}
