import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, assertOwner } from "@/lib/api-helpers"
import { updateNotebookSchema } from "@/lib/schemas"

type Params = { params: { id: string } }

// GET /api/notebooks/[id]
export async function GET(_req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const notebook = await prisma.notebook.findUnique({
            where: { id: params.id },
            include: {
                folder: { select: { id: true, name: true } },
                notes: {
                    where: { deletedAt: null },
                    orderBy: { updatedAt: "desc" },
                    select: { id: true, title: true, updatedAt: true, syncStatus: true, docType: true },
                },
            },
        })

        if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(notebook.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        return NextResponse.json(notebook)
    } catch (e) {
        console.error("[GET /api/notebooks/[id]]", e)
        return apiError("Failed to load notebook")
    }
}

// PATCH /api/notebooks/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const existing = await prisma.notebook.findUnique({ where: { id: params.id } })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const parsed = updateNotebookSchema.safeParse(body)
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        const updated = await prisma.notebook.update({
            where: { id: params.id },
            data: parsed.data,
        })

        return NextResponse.json(updated)
    } catch (e) {
        console.error("[PATCH /api/notebooks/[id]]", e)
        return apiError("Failed to update notebook")
    }
}

// DELETE /api/notebooks/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const existing = await prisma.notebook.findUnique({ where: { id: params.id } })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        await prisma.notebook.update({
            where: { id: params.id },
            data: { deletedAt: new Date() },
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("[DELETE /api/notebooks/[id]]", e)
        return apiError("Failed to delete notebook")
    }
}
