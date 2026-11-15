import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, assertOwner } from "@/lib/api-helpers"
import { createNoteSchema } from "@/lib/schemas"

type Params = { params: Promise<{ id: string }> }

// GET /api/notebooks/[id]/notes — notes inside a specific notebook
export async function GET(req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const notebook = await prisma.notebook.findUnique({ where: { id } })
        if (!notebook || notebook.deletedAt)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(notebook.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const notes = await prisma.note.findMany({
            where: { notebookId: id, deletedAt: null, isArchived: false },
            orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
            select: {
                id: true, title: true, docType: true, isFavorite: true,
                isPinned: true, syncStatus: true, createdAt: true, updatedAt: true,
            },
        })

        return NextResponse.json(notes)
    } catch (e) {
        console.error("[GET /api/notebooks/[id]/notes]", e)
        return apiError("Failed to load notes")
    }
}

// POST /api/notebooks/[id]/notes — create a note inside a given notebook
export async function POST(req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const notebook = await prisma.notebook.findUnique({ where: { id } })
        if (!notebook || notebook.deletedAt)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(notebook.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const parsed = createNoteSchema.safeParse({ ...body, notebookId: id })
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        const note = await prisma.note.create({
            data: {
                ownerId: session.user.id,
                title: parsed.data.title,
                docType: parsed.data.docType,
                content: parsed.data.content ?? {},
                notebookId: id,
            },
        })

        return NextResponse.json(note, { status: 201 })
    } catch (e) {
        console.error("[POST /api/notebooks/[id]/notes]", e)
        return apiError("Failed to create note")
    }
}
