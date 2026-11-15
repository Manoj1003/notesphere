import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: [
                        "openid",
                        "profile",
                        "email",
                        "https://www.googleapis.com/auth/drive.file",
                    ].join(" "),
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    session: {
        strategy: "database",
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
            }
            return session
        },
        async signIn({ user, account }) {
            // Store the refresh token on the User record for Drive access
            if (account?.provider === "google" && account.refresh_token) {
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            driveConnectedAt: new Date(),
                        },
                    })
                    // refresh_token is stored in the Account record by the Prisma adapter
                } catch {
                    // Non-fatal — user can reconnect Drive later
                }
            }
            return true
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
})
