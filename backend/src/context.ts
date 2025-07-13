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
  const token = req.headers.authorization?.replace("Bearer ", "")

  let user
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
      user = decoded
    } catch (error) {
      // Invalid token
    }
  }

  return {
    prisma,
    user,
  }
}
