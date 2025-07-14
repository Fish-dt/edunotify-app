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
    students: [Student!]!
    myChildren: [Student!]!
    grades(studentId: ID!): [Grade!]!
    behaviorReports(studentId: ID!): [BehaviorReport!]!
    events: [Event!]!
    learningResources(studentId: ID!): [LearningResource!]!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!, role: Role!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    createStudent(name: String!, grade: String!, parentId: String!): Student!
    
    createGrade(subject: String!, score: Float!, maxScore: Float!, studentId: String!): Grade!
    updateGrade(id: ID!, subject: String, score: Float, maxScore: Float): Grade!
    
    createBehaviorReport(title: String!, description: String!, type: BehaviorType!, studentId: String!): BehaviorReport!
    
    createEvent(title: String!, description: String!, date: String!): Event!

    # New mutations for admin to create teacher and parent
    createTeacher(email: String!, password: String!, name: String!): AuthPayload!
    createParent(email: String!, password: String!, name: String!): AuthPayload!
  }
`
