import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopBar } from "@/components/layout/app-topbar"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user) redirect("/auth/signin")

    return (
        <div className="app-layout">
            <AppSidebar user={session.user} />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <AppTopBar user={session.user} />
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    )
}
