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

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "TEACHER", "PARENT"]),
})

const studentSchema = z.object({
  name: z.string().min(2),
  grade: z.string().min(1),
  parentId: z.string(),
})

const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().min(5),
  teacherId: z.string(),
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

    users: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      return await context.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      })
    },

    parents: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN" && context.user.role !== "TEACHER") {
        throw new Error("Not authorized")
      }

      return await context.prisma.user.findMany({
        where: { role: "PARENT" },
        orderBy: { name: "asc" },
      })
    },

    teachers: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      return await context.prisma.user.findMany({
        where: { role: "TEACHER" },
        orderBy: { name: "asc" },
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
              orderBy: { createdAt: "desc" },
            },
            behaviorReports: {
              include: { teacher: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { name: "asc" },
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
              orderBy: { createdAt: "desc" },
            },
            behaviorReports: {
              include: { teacher: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { name: "asc" },
        })
      }

      throw new Error("Not authorized")
    },

    courses: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      return await context.prisma.course.findMany({
        include: { teacher: true },
        orderBy: { name: "asc" },
      })
    },

    myCourses: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role === "TEACHER") {
        return await context.prisma.course.findMany({
          where: { teacherId: context.user.id },
          include: { teacher: true },
          orderBy: { name: "asc" },
        })
      }

      throw new Error("Not authorized")
    },

    grades: async (_: any, { studentId }: { studentId: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

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
      const { email, password } = args

      const user = await context.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new Error("Invalid credentials")
      }

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        throw new Error("Invalid credentials")
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

      return { token, user }
    },

    // User Management
    createUser: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const validatedData = userSchema.parse(args)

      const existingUser = await context.prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        throw new Error("User already exists")
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      return await context.prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
        },
      })
    },

    updateUser: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const user = await context.prisma.user.findUnique({ where: { id } })
      if (!user) throw new Error("User not found")

      return await context.prisma.user.update({
        where: { id },
        data: updates,
      })
    },

    deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const user = await context.prisma.user.findUnique({ where: { id } })
      if (!user) throw new Error("User not found")

      await context.prisma.user.delete({ where: { id } })
      return true
    },

    // Student Management
    createStudent: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const validatedData = studentSchema.parse(args)

      // Verify parent exists and is a parent
      const parent = await context.prisma.user.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parent || parent.role !== "PARENT") {
        throw new Error("Invalid parent ID")
      }

      return await context.prisma.student.create({
        data: validatedData,
        include: { parent: true },
      })
    },

    updateStudent: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const student = await context.prisma.student.findUnique({ where: { id } })
      if (!student) throw new Error("Student not found")

      return await context.prisma.student.update({
        where: { id },
        data: updates,
        include: { parent: true },
      })
    },

    deleteStudent: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const student = await context.prisma.student.findUnique({ where: { id } })
      if (!student) throw new Error("Student not found")

      await context.prisma.student.delete({ where: { id } })
      return true
    },

    // Course Management
    createCourse: async (_: any, args: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const validatedData = courseSchema.parse(args)

      // Verify teacher exists and is a teacher
      const teacher = await context.prisma.user.findUnique({
        where: { id: validatedData.teacherId },
      })

      if (!teacher || teacher.role !== "TEACHER") {
        throw new Error("Invalid teacher ID")
      }

      return await context.prisma.course.create({
        data: validatedData,
        include: { teacher: true },
      })
    },

    updateCourse: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const course = await context.prisma.course.findUnique({ where: { id } })
      if (!course) throw new Error("Course not found")

      return await context.prisma.course.update({
        where: { id },
        data: updates,
        include: { teacher: true },
      })
    },

    deleteCourse: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")
      if (context.user.role !== "ADMIN") throw new Error("Not authorized")

      const course = await context.prisma.course.findUnique({ where: { id } })
      if (!course) throw new Error("Course not found")

      await context.prisma.course.delete({ where: { id } })
      return true
    },

    // Grade Management
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

    deleteGrade: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const grade = await context.prisma.grade.findUnique({ where: { id } })
      if (!grade) throw new Error("Grade not found")

      if (context.user.role === "TEACHER" && grade.teacherId !== context.user.id) {
        throw new Error("Not authorized")
      }

      await context.prisma.grade.delete({ where: { id } })
      return true
    },

    // Behavior Reports
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

    updateBehaviorReport: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const report = await context.prisma.behaviorReport.findUnique({ where: { id } })
      if (!report) throw new Error("Behavior report not found")

      if (context.user.role === "TEACHER" && report.teacherId !== context.user.id) {
        throw new Error("Not authorized")
      }

      return await context.prisma.behaviorReport.update({
        where: { id },
        data: updates,
        include: { student: true, teacher: true },
      })
    },

    deleteBehaviorReport: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const report = await context.prisma.behaviorReport.findUnique({ where: { id } })
      if (!report) throw new Error("Behavior report not found")

      if (context.user.role === "TEACHER" && report.teacherId !== context.user.id) {
        throw new Error("Not authorized")
      }

      await context.prisma.behaviorReport.delete({ where: { id } })
      return true
    },

    // Events
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

    updateEvent: async (_: any, { id, ...updates }: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const event = await context.prisma.event.findUnique({ where: { id } })
      if (!event) throw new Error("Event not found")

      if (context.user.role === "TEACHER" && event.createdBy !== context.user.id) {
        throw new Error("Not authorized")
      }

      return await context.prisma.event.update({
        where: { id },
        data: updates,
        include: { creator: true },
      })
    },

    deleteEvent: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated")

      if (context.user.role !== "TEACHER" && context.user.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      const event = await context.prisma.event.findUnique({ where: { id } })
      if (!event) throw new Error("Event not found")

      if (context.user.role === "TEACHER" && event.createdBy !== context.user.id) {
        throw new Error("Not authorized")
      }

      await context.prisma.event.delete({ where: { id } })
      return true
    },
  },
}
