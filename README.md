# EduNotify - School Communication App

A modern, full-stack school communication app for Ethiopian schools that helps parents, teachers, and admins share and view student grades, behavior reports, events, and personalized learning suggestions.

## Features

- **Role-based Access Control**: Admin, Teacher, and Parent roles with appropriate permissions
- **Authentication**: Secure login using JWT tokens
- **Student Management**: Track grades, behavior reports, and progress
- **Event Management**: Create and view school events
- **AI-Powered Recommendations**: Learning resource suggestions based on student performance
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **GraphQL API**: Efficient data fetching with Apollo Server

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TanStack Router for routing
- Apollo Client for GraphQL
- Zustand for state management
- Tailwind CSS for styling
- Radix UI components

### Backend
- Node.js with Express
- Apollo Server (GraphQL)
- Prisma ORM with PostgreSQL
- JWT authentication
- Zod for validation
- TypeScript throughout

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd edunotify
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm run install:all
   \`\`\`

3. **Set up the database**
   \`\`\`bash
   # Create a PostgreSQL database named 'edunotify'
   createdb edunotify
   
   # Update the DATABASE_URL in backend/.env
   # Example: DATABASE_URL="postgresql://username:password@localhost:5432/edunotify?schema=public"
   \`\`\`

4. **Configure environment variables**
   \`\`\`bash
   cd backend
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   \`\`\`

5. **Run database migrations and seed data**
   \`\`\`bash
   npm run db:migrate
   npm run db:seed
   \`\`\`

6. **Start the development servers**
   \`\`\`bash
   npm run dev
   \`\`\`

This will start:
- Backend GraphQL server at http://localhost:4000/graphql
- Frontend React app at http://localhost:5173

## Demo Accounts

After seeding the database, you can use these demo accounts:

- **Admin**: admin@edunotify.com / admin123
- **Teacher**: teacher@edunotify.com / teacher123  
- **Parent**: parent@edunotify.com / parent123

## Project Structure

\`\`\`
edunotify/
├── backend/
│   ├── src/
│   │   ├── graphql/          # GraphQL schema and resolvers
│   │   ├── services/         # Business logic (AI service)
│   │   ├── context.ts        # GraphQL context
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Sample data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities (Apollo, auth)
│   │   ├── routes/          # TanStack Router routes
│   │   └── main.tsx         # App entry point
│   └── package.json
└── package.json             # Root package.json
\`\`\`

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Prisma Studio for database management

## Key Features Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control in GraphQL resolvers
- Protected routes on the frontend

### Student Management
- Teachers can add/edit grades and behavior reports
- Parents can view their children's information
- Admins have full access to all students

### AI Learning Recommendations
- Simple rule-based system that analyzes student grades
- Suggests appropriate learning resources based on performance
- Extensible for more sophisticated AI integration

### Real-time Updates
- GraphQL subscriptions ready for implementation
- Optimistic updates with Apollo Client

## Development Guidelines

### Code Style
- TypeScript throughout the application
- ESLint and Prettier configured
- Consistent naming conventions

### Database
- Prisma for type-safe database access
- Migration-based schema management
- Proper foreign key relationships

### Security
- Input validation with Zod
- SQL injection prevention with Prisma
- JWT token expiration
- Role-based authorization

## Future Enhancements

- [ ] Real-time notifications
- [ ] File upload for assignments
- [ ] Advanced AI recommendations using machine learning
- [ ] Mobile app with React Native
- [ ] Email notifications
- [ ] Multi-language support (Amharic, English)
- [ ] Advanced reporting and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


