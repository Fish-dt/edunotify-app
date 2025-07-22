import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { Context } from "../context"
import { z } from "zod"
import { generateLearningResources } from "../services/aiService"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "TEACHER", "PARENT"]),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const gradeSchema = z.object({
  subject: z.string().min(1),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  studentId: z.string(),
})

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      return await context.prisma.user.findUnique({
        where: { id: context.user.id },
      })
    },

    students: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role === "TEACHER" || context.user.role === "ADMIN") {
        return await context.prisma.student.findMany({
          include: {
            parent: true,
            grades: {
              include: { teacher: true },
            },
            behaviorReports: {
              include: { teacher: true },
            },
          },
        })
      }

      throw new Error("Not authorized")
    },

    myChildren: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role === "PARENT") {
        return await context.prisma.student.findMany({
          where: { parentId: context.user.id },
          include: {
            parent: true,
            grades: {
              include: { teacher: true },
            },
            behaviorReports: {
              include: { teacher: true },
            },
          },
        })
      }

      throw new Error("Not authorized")
    },

    grades: async (_: any, { studentId }: { studentId: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      // Check if user can access this student's grades
      const student = await context.prisma.student.findUnique({
        where: { id: studentId },
      })

      if (!student) throw new Error("Student not found")

      if (context.user.role === "PARENT" && student.parentId !== context.user.id) {
        throw new Error("Not authorized")
      }

      return await context.prisma.grade.findMany({
        where: { studentId },
        include: { student: true, teacher: true },
        orderBy: { createdAt: "desc" },
      })
    },

    behaviorReports: async (_: any, { studentId }: { studentId: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      const student = await context.prisma.student.findUnique({
        where: { id: studentId },
      })

      if (!student) throw new Error("Student not found")

      if (context.user.role === "PARENT" && student.parentId !== context.user.id) {
        throw new Error("Not authorized")
      }

      return await context.prisma.behaviorReport.findMany({
        where: { studentId },
        include: { student: true, teacher: true },
        orderBy: { createdAt: "desc" },
      })
    },

    events: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      return await context.prisma.event.findMany({
        include: { creator: true },
        orderBy: { date: "asc" },
      })
    },

    learningResources: async (_: any, { studentId }: { studentId: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      const student = await context.prisma.student.findUnique({
        where: { id: studentId },
        include: { grades: true },
      })

      if (!student) throw new Error("Student not found")

      if (context.user.role === "PARENT" && student.parentId !== context.user.id) {
        throw new Error("Not authorized")
      }

      return generateLearningResources(student.grades)
    },
  },

  Mutation: {
    register: async (_: any, args: any, context: Context) => {
      const validatedData = registerSchema.parse(args)

      const existingUser = await context.prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        throw new Error("User already exists")
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      const user = await context.prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
        },
      })

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

      return { token, user }
    },

    login: async (_: any, args: any, context: Context) => {
      const validatedData = loginSchema.parse(args)

      const user = await context.prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!user) {
        throw new Error("Invalid credentials")
      }

      const valid = await bcrypt.compare(validatedData.password, user.password)

      if (!valid) {
        throw new Error("Invalid credentials")
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

      return { token, user }
    },

    createStudent: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return await context.prisma.student.create({
        data: args,
        include: { parent: true },
      })
    },

    createGrade: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const validatedData = gradeSchema.parse(args)

      return await context.prisma.grade.create({
        data: {
          ...validatedData,
          teacherId: context.user.id,
        },
        include: { student: true, teacher: true },
      })
    },

    updateGrade: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const grade = await context.prisma.grade.findUnique({
        where: { id },
      })

      if (!grade) throw new Error("Grade not found")

      if (context.user.role === "TEACHER" && grade.teacherId !== context.user.id) {
        throw new Error("Not authorized")
      }

      return await context.prisma.grade.update({
        where: { id },
        data: updates,
        include: { student: true, teacher: true },
      })
    },

    createBehaviorReport: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return await context.prisma.behaviorReport.create({
        data: {
          ...args,
          teacherId: context.user.id,
        },
        include: { student: true, teacher: true },
      })
    },

    createEvent: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return await context.prisma.event.create({
        data: {
          ...args,
          createdBy: context.user.id,
        },
        include: { creator: true },
      })
    },
  },
}
