export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    createdAt: String!
  }

  type Student {
    id: ID!
    name: String!
    grade: String!
    parentId: String!
    parent: User!
    grades: [Grade!]!
    behaviorReports: [BehaviorReport!]!
  }

  type Grade {
    id: ID!
    subject: String!
    score: Float!
    maxScore: Float!
    studentId: String!
    student: Student!
    teacherId: String!
    teacher: User!
    createdAt: String!
  }

  type BehaviorReport {
    id: ID!
    title: String!
    description: String!
    type: BehaviorType!
    studentId: String!
    student: Student!
    teacherId: String!
    teacher: User!
    createdAt: String!
  }

  type Event {
    id: ID!
    title: String!
    description: String!
    date: String!
    createdBy: String!
    creator: User!
    createdAt: String!
  }

  type Course {
    id: ID!
    name: String!
    code: String!
    description: String!
    teacherId: String!
    teacher: User!
    createdAt: String!
  }

  type LearningResource {
    id: ID!
    title: String!
    description: String!
    url: String!
    subject: String!
    difficulty: String!
  }

  enum Role {
    ADMIN
    TEACHER
    PARENT
  }

  enum BehaviorType {
    POSITIVE
    NEGATIVE
    NEUTRAL
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    students: [Student!]!
    myChildren: [Student!]!
    grades(studentId: ID!): [Grade!]!
    behaviorReports(studentId: ID!): [BehaviorReport!]!
    events: [Event!]!
    courses: [Course!]!
    myCourses: [Course!]!
    learningResources(studentId: ID!): [LearningResource!]!
    parents: [User!]!
    teachers: [User!]!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!, role: Role!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    # User Management
    createUser(email: String!, password: String!, name: String!, role: Role!): User!
    updateUser(id: ID!, email: String, name: String, role: Role): User!
    deleteUser(id: ID!): Boolean!
    
    # Student Management
    createStudent(name: String!, grade: String!, parentId: String!): Student!
    updateStudent(id: ID!, name: String, grade: String, parentId: String): Student!
    deleteStudent(id: ID!): Boolean!
    
    # Course Management
    createCourse(name: String!, code: String!, description: String!, teacherId: String!): Course!
    updateCourse(id: ID!, name: String, code: String, description: String, teacherId: String): Course!
    deleteCourse(id: ID!): Boolean!
    
    # Grade Management
    createGrade(subject: String!, score: Float!, maxScore: Float!, studentId: String!): Grade!
    updateGrade(id: ID!, subject: String, score: Float, maxScore: Float): Grade!
    deleteGrade(id: ID!): Boolean!
    
    # Behavior Reports
    createBehaviorReport(title: String!, description: String!, type: BehaviorType!, studentId: String!): BehaviorReport!
    updateBehaviorReport(id: ID!, title: String, description: String, type: BehaviorType): BehaviorReport!
    deleteBehaviorReport(id: ID!): Boolean!
    
    # Events
    createEvent(title: String!, description: String!, date: String!): Event!
    updateEvent(id: ID!, title: String, description: String, date: String): Event!
    deleteEvent(id: ID!): Boolean!
  }
`
