import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Get the authenticated user's session or return a 401 response.
 * Usage:
 *   const { session, error } = await requireAuth()
 *   if (error) return error
 */
export async function requireAuth(): Promise<
    | { session: { user: { id: string; name?: string | null; email?: string | null; image?: string | null } }; error: null }
    | { session: null; error: NextResponse }
> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            session: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        }
    }
    return { session: session as { user: { id: string; name?: string | null; email?: string | null; image?: string | null } }, error: null }
}

/**
 * Standard API error response factory.
 */
export function apiError(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status })
}

/**
 * Validate that a resource belongs to the authenticated user.
 * Returns true if ownership is confirmed.
 */
export function assertOwner(resourceOwnerId: string, userId: string): boolean {
    return resourceOwnerId === userId
}
