import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl, auth: session } = req
    const isAuthenticated = !!session?.user

    // Protected routes require authentication
    const isAppRoute = nextUrl.pathname.startsWith("/app")
    const isApiRoute =
        nextUrl.pathname.startsWith("/api") &&
        !nextUrl.pathname.startsWith("/api/auth")

    if ((isAppRoute || isApiRoute) && !isAuthenticated) {
        const signInUrl = new URL("/auth/signin", nextUrl.origin)
        signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = nextUrl.pathname.startsWith("/auth/signin")
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL("/app/dashboard", nextUrl.origin))
    }

    return NextResponse.next()
})

export const config = {
    // Protect /app/* and /api/* (except /api/auth/*)
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
