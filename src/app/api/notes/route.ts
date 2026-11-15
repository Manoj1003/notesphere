import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError } from "@/lib/api-helpers"
import { createNoteSchema, searchSchema } from "@/lib/schemas"

// GET /api/notes — list / search notes for the authenticated user
export async function GET(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")
    const notebookId = searchParams.get("notebookId")
    const filter = searchParams.get("filter") // favorites | pinned | recent | archived | trash
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100)
    const cursor = searchParams.get("cursor")

    try {
        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { ownerId: session.user.id }

        if (filter === "trash") {
            where.deletedAt = { not: null }
        } else if (filter === "archived") {
            where.isArchived = true
            where.deletedAt = null
        } else {
            where.deletedAt = null
            where.isArchived = false
        }

        if (filter === "favorites") where.isFavorite = true
        if (filter === "pinned") where.isPinned = true
        if (notebookId) where.notebookId = notebookId

        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
            ]
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: cursor
                ? [{ updatedAt: "desc" }, { id: "asc" }]
                : [{ isPinned: "desc" }, { updatedAt: "desc" }],
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: {
                id: true,
                title: true,
                docType: true,
                isFavorite: true,
                isPinned: true,
                isArchived: true,
                syncStatus: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                notebookId: true,
                notebook: { select: { id: true, title: true, color: true } },
            },
        })

        const hasMore = notes.length > limit
        if (hasMore) notes.pop()
        const nextCursor = hasMore ? notes[notes.length - 1]?.id : null

        return NextResponse.json({ notes, nextCursor, hasMore })
    } catch (e) {
        console.error("[GET /api/notes]", e)
        return apiError("Failed to load notes")
    }
}

// POST /api/notes — create a new note
export async function POST(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const body = await req.json()
        const parsed = createNoteSchema.safeParse(body)
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        // Validate notebook ownership if provided
        if (parsed.data.notebookId) {
            const nb = await prisma.notebook.findUnique({ where: { id: parsed.data.notebookId } })
            if (!nb || nb.ownerId !== session.user.id)
                return NextResponse.json({ error: "Notebook not found" }, { status: 404 })
        }

        const note = await prisma.note.create({
            data: {
                ownerId: session.user.id,
                title: parsed.data.title,
                docType: parsed.data.docType,
                content: parsed.data.content ?? {},
                notebookId: parsed.data.notebookId ?? null,
            },
        })

        return NextResponse.json(note, { status: 201 })
    } catch (e) {
        console.error("[POST /api/notes]", e)
        return apiError("Failed to create note")
    }
}
