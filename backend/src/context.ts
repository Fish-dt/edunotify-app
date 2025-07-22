import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  user?: {
    id: string
    email: string
    role: string
  }
}

export async function createContext({ req }: { req: any }): Promise<Context> {
  let token = req.headers.authorization

  // Handle both "Bearer token" and just "token" formats
  if (token) {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7)
    }
  }

  let user
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Verify user still exists in database
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      })

      if (dbUser) {
        user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        }
      }
    } catch (error: any) {
      console.log("JWT verification failed:", error.message)
      // Invalid token - user will be null
    }
  }

  return {
    prisma,
    user,
  }
}
