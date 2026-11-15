"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Pen, Loader2 } from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SignInContent() {
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") ?? "/app/dashboard"

    const handleGoogleSignIn = async () => {
        setLoading(true)
        try {
            await signIn("google", { callbackUrl })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50">
                        <Pen className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
                    <p className="text-slate-400 text-sm mt-1">Your notes, everywhere</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white text-center mb-2">
                        Sign in to continue
                    </h2>
                    <p className="text-slate-400 text-sm text-center mb-6">
                        We&apos;ll sync your notes with your Google Drive
                    </p>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-medium text-sm transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <p className="text-xs text-slate-500 text-center mt-5 leading-relaxed">
                        By signing in you agree to our Terms. {APP_NAME} will request access to your Google Drive
                        to sync your notes (only files it creates).
                    </p>
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    © {new Date().getFullYear()} {APP_NAME}
                </p>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense>
            <SignInContent />
        </Suspense>
    )
}
