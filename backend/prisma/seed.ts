import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      email: "admin@edunotify.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  })

  // Create teacher user
  const teacherPassword = await bcrypt.hash("teacher123", 12)
  const teacher = await prisma.user.create({
    data: {
      email: "teacher@edunotify.com",
      password: teacherPassword,
      name: "Almaz Tadesse",
      role: "TEACHER",
    },
  })

  // Create parent user
  const parentPassword = await bcrypt.hash("parent123", 12)
  const parent = await prisma.user.create({
    data: {
      email: "parent@edunotify.com",
      password: parentPassword,
      name: "Kebede Alemu",
      role: "PARENT",
    },
  })

  // Create student
  const student = await prisma.student.create({
    data: {
      name: "Hanan Kebede",
      grade: "Grade 8",
      parentId: parent.id,
    },
  })

  // Create sample grades
  await prisma.grade.createMany({
    data: [
      {
        subject: "Mathematics",
        score: 85,
        maxScore: 100,
        studentId: student.id,
        teacherId: teacher.id,
      },
      {
        subject: "English",
        score: 92,
        maxScore: 100,
        studentId: student.id,
        teacherId: teacher.id,
      },
      {
        subject: "Science",
        score: 78,
        maxScore: 100,
        studentId: student.id,
        teacherId: teacher.id,
      },
    ],
  })

  // Create sample behavior report
  await prisma.behaviorReport.create({
    data: {
      title: "Excellent Participation",
      description: "Hanan actively participated in class discussions and helped other students.",
      type: "POSITIVE",
      studentId: student.id,
      teacherId: teacher.id,
    },
  })

  // Create sample event
  await prisma.event.create({
    data: {
      title: "Parent-Teacher Conference",
      description: "Monthly meeting to discuss student progress.",
      date: new Date("2024-02-15T10:00:00Z"),
      createdBy: teacher.id,
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
