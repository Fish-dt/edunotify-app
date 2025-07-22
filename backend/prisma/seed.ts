import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@edunotify.com" },
    update: {},
    create: {
      email: "admin@edunotify.com",
      password: adminPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  })

  // Create teachers
  const teacher1Password = await bcrypt.hash("teacher123", 12)
  const teacher1 = await prisma.user.upsert({
    where: { email: "almaz@edunotify.com" },
    update: {},
    create: {
      email: "almaz@edunotify.com",
      password: teacher1Password,
      name: "Almaz Tadesse",
      role: "TEACHER",
    },
  })

  const teacher2Password = await bcrypt.hash("teacher123", 12)
  const teacher2 = await prisma.user.upsert({
    where: { email: "bekele@edunotify.com" },
    update: {},
    create: {
      email: "bekele@edunotify.com",
      password: teacher2Password,
      name: "Bekele Mekuria",
      role: "TEACHER",
    },
  })

  const teacher3Password = await bcrypt.hash("teacher123", 12)
  const teacher3 = await prisma.user.upsert({
    where: { email: "sara@edunotify.com" },
    update: {},
    create: {
      email: "sara@edunotify.com",
      password: teacher3Password,
      name: "Sara Alemayehu",
      role: "TEACHER",
    },
  })

  // Create parents
  const parent1Password = await bcrypt.hash("parent123", 12)
  const parent1 = await prisma.user.upsert({
    where: { email: "kebede@edunotify.com" },
    update: {},
    create: {
      email: "kebede@edunotify.com",
      password: parent1Password,
      name: "Kebede Alemu",
      role: "PARENT",
    },
  })

  const parent2Password = await bcrypt.hash("parent123", 12)
  const parent2 = await prisma.user.upsert({
    where: { email: "meron@edunotify.com" },
    update: {},
    create: {
      email: "meron@edunotify.com",
      password: parent2Password,
      name: "Meron Haile",
      role: "PARENT",
    },
  })

  const parent3Password = await bcrypt.hash("parent123", 12)
  const parent3 = await prisma.user.upsert({
    where: { email: "dawit@edunotify.com" },
    update: {},
    create: {
      email: "dawit@edunotify.com",
      password: parent3Password,
      name: "Dawit Tesfaye",
      role: "PARENT",
    },
  })

  // Create courses
  const mathCourse = await prisma.course.upsert({
    where: { code: "MATH8" },
    update: {},
    create: {
      name: "Mathematics Grade 8",
      code: "MATH8",
      description: "Algebra, Geometry, and Basic Statistics for Grade 8 students",
      teacherId: teacher1.id,
    },
  })

  const englishCourse = await prisma.course.upsert({
    where: { code: "ENG8" },
    update: {},
    create: {
      name: "English Grade 8",
      code: "ENG8",
      description: "Reading, Writing, Grammar, and Literature for Grade 8 students",
      teacherId: teacher2.id,
    },
  })

  const scienceCourse = await prisma.course.upsert({
    where: { code: "SCI8" },
    update: {},
    create: {
      name: "Science Grade 8",
      code: "SCI8",
      description: "Physics, Chemistry, and Biology fundamentals for Grade 8 students",
      teacherId: teacher3.id,
    },
  })

  // Create students
  const student1 = await prisma.student.upsert({
    where: { id: "student1" },
    update: {},
    create: {
      id: "student1",
      name: "Hanan Kebede",
      grade: "Grade 8A",
      parentId: parent1.id,
    },
  })

  const student2 = await prisma.student.upsert({
    where: { id: "student2" },
    update: {},
    create: {
      id: "student2",
      name: "Abel Meron",
      grade: "Grade 8A",
      parentId: parent2.id,
    },
  })

  const student3 = await prisma.student.upsert({
    where: { id: "student3" },
    update: {},
    create: {
      id: "student3",
      name: "Liya Dawit",
      grade: "Grade 8B",
      parentId: parent3.id,
    },
  })

  const student4 = await prisma.student.upsert({
    where: { id: "student4" },
    update: {},
    create: {
      id: "student4",
      name: "Yonas Kebede",
      grade: "Grade 8B",
      parentId: parent1.id,
    },
  })

  // Create sample grades
  const grades = [
    // Hanan's grades
    { subject: "Mathematics", score: 85, maxScore: 100, studentId: student1.id, teacherId: teacher1.id },
    { subject: "English", score: 92, maxScore: 100, studentId: student1.id, teacherId: teacher2.id },
    { subject: "Science", score: 78, maxScore: 100, studentId: student1.id, teacherId: teacher3.id },
    { subject: "Mathematics", score: 88, maxScore: 100, studentId: student1.id, teacherId: teacher1.id },

    // Abel's grades
    { subject: "Mathematics", score: 76, maxScore: 100, studentId: student2.id, teacherId: teacher1.id },
    { subject: "English", score: 84, maxScore: 100, studentId: student2.id, teacherId: teacher2.id },
    { subject: "Science", score: 91, maxScore: 100, studentId: student2.id, teacherId: teacher3.id },

    // Liya's grades
    { subject: "Mathematics", score: 94, maxScore: 100, studentId: student3.id, teacherId: teacher1.id },
    { subject: "English", score: 89, maxScore: 100, studentId: student3.id, teacherId: teacher2.id },
    { subject: "Science", score: 87, maxScore: 100, studentId: student3.id, teacherId: teacher3.id },

    // Yonas's grades
    { subject: "Mathematics", score: 72, maxScore: 100, studentId: student4.id, teacherId: teacher1.id },
    { subject: "English", score: 79, maxScore: 100, studentId: student4.id, teacherId: teacher2.id },
    { subject: "Science", score: 83, maxScore: 100, studentId: student4.id, teacherId: teacher3.id },
  ]

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: {
        id: `${grade.studentId}-${grade.subject}-${grade.teacherId}`,
      },
      update: {},
      create: {
        id: `${grade.studentId}-${grade.subject}-${grade.teacherId}`,
        ...grade,
      },
    })
  }

  // Create sample behavior reports
  const behaviorReports = [
    {
      title: "Excellent Class Participation",
      description:
        "Hanan actively participated in class discussions and helped other students understand difficult concepts.",
      type: "POSITIVE",
      studentId: student1.id,
      teacherId: teacher1.id,
    },
    {
      title: "Improved Homework Submission",
      description: "Abel has shown significant improvement in submitting homework on time.",
      type: "POSITIVE",
      studentId: student2.id,
      teacherId: teacher2.id,
    },
    {
      title: "Outstanding Science Project",
      description: "Liya presented an exceptional science project on renewable energy sources.",
      type: "POSITIVE",
      studentId: student3.id,
      teacherId: teacher3.id,
    },
    {
      title: "Needs Attention in Math",
      description: "Yonas is struggling with algebra concepts and may need additional support.",
      type: "NEUTRAL",
      studentId: student4.id,
      teacherId: teacher1.id,
    },
  ]

  for (const report of behaviorReports) {
    await prisma.behaviorReport.create({
      data: report,
    })
  }

  // Create sample events
  const events = [
    {
      title: "Parent-Teacher Conference",
      description: "Monthly meeting to discuss student progress and address any concerns.",
      date: new Date("2024-02-15T10:00:00Z"),
      createdBy: teacher1.id,
    },
    {
      title: "Science Fair",
      description: "Annual science fair where students showcase their innovative projects.",
      date: new Date("2024-03-20T09:00:00Z"),
      createdBy: teacher3.id,
    },
    {
      title: "Mathematics Competition",
      description: "Inter-class mathematics competition for Grade 8 students.",
      date: new Date("2024-02-28T14:00:00Z"),
      createdBy: teacher1.id,
    },
    {
      title: "English Literature Week",
      description: "A week-long celebration of literature with poetry readings and book discussions.",
      date: new Date("2024-03-05T08:00:00Z"),
      createdBy: teacher2.id,
    },
  ]

  for (const event of events) {
    await prisma.event.create({
      data: event,
    })
  }

  console.log("✅ Database seeded successfully!")
  console.log("\n📚 Demo Accounts Created:")
  console.log("👨‍💼 Admin: admin@edunotify.com / admin123")
  console.log("👩‍🏫 Teachers:")
  console.log("  - almaz@edunotify.com / teacher123 (Mathematics)")
  console.log("  - bekele@edunotify.com / teacher123 (English)")
  console.log("  - sara@edunotify.com / teacher123 (Science)")
  console.log("👨‍👩‍👧‍👦 Parents:")
  console.log("  - kebede@edunotify.com / parent123 (Hanan & Yonas)")
  console.log("  - meron@edunotify.com / parent123 (Abel)")
  console.log("  - dawit@edunotify.com / parent123 (Liya)")
  console.log("\n🎓 Students: Hanan, Abel, Liya, Yonas")
  console.log("📖 Courses: Mathematics, English, Science")
  console.log("📊 Sample grades, behavior reports, and events created!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
