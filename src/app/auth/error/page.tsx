"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { Suspense } from "react"

const ERROR_MESSAGES: Record<string, string> = {
    OAuthSignin: "Error starting Google sign-in. Please try again.",
    OAuthCallback: "Error completing sign-in. Please try again.",
    OAuthCreateAccount: "Could not create your account. Please try again.",
    EmailCreateAccount: "Could not create your account.",
    Callback: "Authentication callback error. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with a different sign-in method.",
    AccessDenied: "Access was denied. Please grant the required permissions.",
    Configuration: "Server configuration error. Please contact support.",
    Default: "An unexpected authentication error occurred.",
}

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error") ?? "Default"
    const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/20 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h1 className="text-xl font-semibold text-white mb-2">Sign-in failed</h1>
                <p className="text-slate-400 text-sm mb-6">{message}</p>
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Try again
                </Link>
                <p className="text-xs text-slate-600 mt-6">
                    {APP_NAME} · Error code: {error}
                </p>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense>
            <ErrorContent />
        </Suspense>
    )
}
