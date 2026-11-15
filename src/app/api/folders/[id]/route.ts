import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, assertOwner } from "@/lib/api-helpers"
import { updateFolderSchema } from "@/lib/schemas"

type Params = { params: Promise<{ id: string }> }

// PATCH /api/folders/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const existing = await prisma.folder.findUnique({ where: { id } })
        if (!existing || existing.deletedAt)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const parsed = updateFolderSchema.safeParse(body)
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        const updated = await prisma.folder.update({ where: { id }, data: parsed.data })
        return NextResponse.json(updated)
    } catch (e) {
        console.error("[PATCH /api/folders/[id]]", e)
        return apiError("Failed to update folder")
    }
}

// DELETE /api/folders/[id] — soft delete (also soft deletes notebooks inside)
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const existing = await prisma.folder.findUnique({ where: { id } })
        if (!existing || existing.deletedAt)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const now = new Date()
        // Soft-delete folder and its notebooks
        await prisma.$transaction([
            prisma.notebook.updateMany({
                where: { folderId: id, deletedAt: null },
                data: { deletedAt: now },
            }),
            prisma.folder.update({ where: { id }, data: { deletedAt: now } }),
        ])

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("[DELETE /api/folders/[id]]", e)
        return apiError("Failed to delete folder")
    }
}
