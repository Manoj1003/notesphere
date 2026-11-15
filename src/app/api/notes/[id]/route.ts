import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, assertOwner } from "@/lib/api-helpers"
import { updateNoteSchema } from "@/lib/schemas"

type Params = { params: Promise<{ id: string }> }

// GET /api/notes/[id]
export async function GET(_req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                notebook: { select: { id: true, title: true, color: true } },
                tags: { include: { tag: true } },
                versions: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, createdAt: true, contentHash: true } },
            },
        })

        if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(note.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        return NextResponse.json(note)
    } catch (e) {
        console.error("[GET /api/notes/[id]]", e)
        return apiError("Failed to load note")
    }
}

// PATCH /api/notes/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const existing = await prisma.note.findUnique({ where: { id } })
        if (!existing || existing.deletedAt)
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const parsed = updateNoteSchema.safeParse(body)
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        // Save version snapshot if content changed
        if (parsed.data.content !== undefined) {
            const hash = Buffer.from(JSON.stringify(parsed.data.content ?? {})).toString("base64").slice(0, 64)
            if (hash !== existing.contentHash) {
                await prisma.noteVersion.create({
                    data: {
                        noteId: id,
                        content: existing.content ?? {},
                        contentHash: existing.contentHash ?? "",
                        authorId: session.user.id,
                        label: `Auto-save`,
                    },
                })
            }
        }

        const updated = await prisma.note.update({
            where: { id },
            data: {
                ...parsed.data,
                ...(parsed.data.content !== undefined
                    ? { contentHash: Buffer.from(JSON.stringify(parsed.data.content ?? {})).toString("base64").slice(0, 64) }
                    : {}),
            },
        })

        return NextResponse.json(updated)
    } catch (e) {
        console.error("[PATCH /api/notes/[id]]", e)
        return apiError("Failed to update note")
    }
}

// DELETE /api/notes/[id] — soft delete (moves to trash), or hard delete if already in trash
export async function DELETE(_req: NextRequest, { params }: Params) {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    try {
        const existing = await prisma.note.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (!assertOwner(existing.ownerId, session.user.id))
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        if (existing.deletedAt) {
            // Hard delete (already in trash)
            await prisma.note.delete({ where: { id } })
        } else {
            // Soft delete (move to trash)
            await prisma.note.update({ where: { id }, data: { deletedAt: new Date() } })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("[DELETE /api/notes/[id]]", e)
        return apiError("Failed to delete note")
    }
}
