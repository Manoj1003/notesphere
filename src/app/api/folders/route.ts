import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError } from "@/lib/api-helpers"
import { createFolderSchema } from "@/lib/schemas"

// GET /api/folders — list all folders for the authenticated user
export async function GET() {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const folders = await prisma.folder.findMany({
            where: { ownerId: session.user.id, deletedAt: null },
            include: {
                _count: { select: { notebooks: { where: { deletedAt: null } } } },
                children: {
                    where: { deletedAt: null },
                    select: { id: true, name: true },
                },
            },
            orderBy: { name: "asc" },
        })

        return NextResponse.json(folders)
    } catch (e) {
        console.error("[GET /api/folders]", e)
        return apiError("Failed to load folders")
    }
}

// POST /api/folders — create a new folder
export async function POST(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error

    try {
        const body = await req.json()
        const parsed = createFolderSchema.safeParse(body)
        if (!parsed.success)
            return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

        // Validate parent folder ownership if provided
        if (parsed.data.parentId) {
            const parent = await prisma.folder.findUnique({ where: { id: parsed.data.parentId } })
            if (!parent || parent.ownerId !== session.user.id)
                return NextResponse.json({ error: "Parent folder not found" }, { status: 404 })
        }

        const folder = await prisma.folder.create({
            data: { ownerId: session.user.id, ...parsed.data },
        })

        return NextResponse.json(folder, { status: 201 })
    } catch (e) {
        console.error("[POST /api/folders]", e)
        return apiError("Failed to create folder")
    }
}
