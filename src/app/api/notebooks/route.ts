import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError } from "@/lib/api-helpers"
import { createNotebookSchema, updateNotebookSchema } from "@/lib/schemas"

// GET /api/notebooks — list all notebooks for the authenticated user
export async function GET(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const { searchParams } = new URL(req.url)
        const archived = searchParams.get("archived") === "true"

        const notebooks = await prisma.notebook.findMany({
            where: {
                ownerId: session.user.id,
                isArchived: archived,
                deletedAt: null,
            },
            include: {
                folder: { select: { id: true, name: true } },
                _count: { select: { notes: { where: { deletedAt: null } } } },
            },
            orderBy: [{ isPinned: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
        })

        return NextResponse.json(notebooks)
    } catch (e) {
        console.error("[GET /api/notebooks]", e)
        return apiError("Failed to load notebooks")
    }
}

// POST /api/notebooks — create a new notebook
export async function POST(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const body = await req.json()
        const parsed = createNotebookSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.errors },
                { status: 400 }
            )
        }

        const notebook = await prisma.notebook.create({
            data: {
                ownerId: session.user.id,
                ...parsed.data,
            },
        })

        return NextResponse.json(notebook, { status: 201 })
    } catch (e) {
        console.error("[POST /api/notebooks]", e)
        return apiError("Failed to create notebook")
    }
}
