import Link from "next/link"
import { APP_NAME } from "@/lib/constants"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BookOpen, Cloud, Pen, Search, Shield, Zap } from "lucide-react"

export default async function WelcomePage() {
  const session = await auth()
  if (session?.user) redirect("/app/dashboard")

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Pen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <Link
          href="/auth/signin"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Rich text · Handwriting · Google Drive sync
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Your ideas,{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            beautifully organised
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {APP_NAME} combines rich-text editing, handwriting, PDF annotation, and automatic
          Google Drive synchronisation into one distraction-free workspace.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25"
        >
          Get started free
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-xs text-slate-500 mt-4">No credit card required · Sign in with Google</p>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: <Pen className="w-5 h-5 text-indigo-400" />,
            title: "Rich-text & Handwriting",
            desc: "Full formatting toolbar, headings, tables, checklists, drawing canvas with pressure sensitivity.",
          },
          {
            icon: <Cloud className="w-5 h-5 text-violet-400" />,
            title: "Google Drive Sync",
            desc: "All notes are automatically saved to your own Google Drive. Access them from any device.",
          },
          {
            icon: <BookOpen className="w-5 h-5 text-pink-400" />,
            title: "PDF Import & Annotation",
            desc: "Import PDFs, highlight text, add handwritten notes, and export annotated documents.",
          },
          {
            icon: <Search className="w-5 h-5 text-teal-400" />,
            title: "Full-text Search",
            desc: "Instantly search across all your notes, notebooks, tags, and document content.",
          },
          {
            icon: <Shield className="w-5 h-5 text-green-400" />,
            title: "Private & Secure",
            desc: "Your notes live in your Google Drive. OAuth 2.0 authentication, server-side auth checks.",
          },
          {
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
            title: "Offline First",
            desc: "Keep writing even without Wi-Fi. Changes sync automatically when you reconnect.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
          >
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-1.5 text-sm">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {APP_NAME} · Built with Next.js, Prisma, and Google Drive API
      </footer>
    </main>
  )
}
