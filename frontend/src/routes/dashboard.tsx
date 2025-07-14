import { Button } from "@/components/ui/button"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, gql, useMutation } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react"
import React from "react"

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    me {
      id
      name
      role
    }
    myChildren {
      id
      name
      grade
    }
    events {
      id
      title
      date
    }
  }
`

const CREATE_TEACHER = gql`
  mutation CreateTeacher($email: String!, $password: String!, $name: String!) {
    createTeacher(email: $email, password: $password, name: $name) {
      user { id email name role }
    }
  }
`
const CREATE_PARENT = gql`
  mutation CreateParent($email: String!, $password: String!, $name: String!) {
    createParent(email: $email, password: $password, name: $name) {
      user { id email name role }
    }
  }
`

function Dashboard() {
  const { user } = useAuthStore()
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA)
  const [teacherForm, setTeacherForm] = React.useState({ email: "", password: "", name: "" })
  const [parentForm, setParentForm] = React.useState({ email: "", password: "", name: "" })
  const [createTeacher, { loading: loadingTeacher, error: errorTeacher }] = useMutation(CREATE_TEACHER)
  const [createParent, { loading: loadingParent, error: errorParent }] = useMutation(CREATE_PARENT)
  const [successMsg, setSuccessMsg] = React.useState("")

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const stats = [
    {
      title: "Students",
      value: user?.role === "PARENT" ? data?.myChildren?.length || 0 : "12",
      icon: Users,
      description: user?.role === "PARENT" ? "Your children" : "Total students",
    },
    {
      title: "Events",
      value: data?.events?.length || 0,
      icon: Calendar,
      description: "Upcoming events",
    },
    {
      title: "Grades",
      value: "8.5",
      icon: TrendingUp,
      description: "Average score",
    },
    {
      title: "Reports",
      value: "3",
      icon: BookOpen,
      description: "This month",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {data?.me?.name}!</h1>
        <p className="text-gray-600">Here's what's happening in your school today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {user?.role === "PARENT" && data?.myChildren && (
        <Card>
          <CardHeader>
            <CardTitle>Your Children</CardTitle>
            <CardDescription>Overview of your children's information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.myChildren.map((child: any) => (
                <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.grade}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === "ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Teacher Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Teacher</CardTitle>
              <CardDescription>Add a new teacher account</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setSuccessMsg("")
                  try {
                    await createTeacher({ variables: teacherForm })
                    setSuccessMsg("Teacher created successfully!")
                    setTeacherForm({ email: "", password: "", name: "" })
                  } catch {}
                }}
                className="space-y-2"
              >
                <input
                  className="border p-2 w-full"
                  type="email"
                  placeholder="Email"
                  value={teacherForm.email}
                  onChange={e => setTeacherForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  className="border p-2 w-full"
                  type="text"
                  placeholder="Name"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className="border p-2 w-full"
                  type="password"
                  placeholder="Password"
                  value={teacherForm.password}
                  onChange={e => setTeacherForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <Button type="submit" disabled={loadingTeacher}>Create Teacher</Button>
                {errorTeacher && <div className="text-red-500 text-sm">{errorTeacher.message}</div>}
              </form>
            </CardContent>
          </Card>

          {/* Create Parent Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Parent</CardTitle>
              <CardDescription>Add a new parent account</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setSuccessMsg("")
                  try {
                    await createParent({ variables: parentForm })
                    setSuccessMsg("Parent created successfully!")
                    setParentForm({ email: "", password: "", name: "" })
                  } catch {}
                }}
                className="space-y-2"
              >
                <input
                  className="border p-2 w-full"
                  type="email"
                  placeholder="Email"
                  value={parentForm.email}
                  onChange={e => setParentForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <input
                  className="border p-2 w-full"
                  type="text"
                  placeholder="Name"
                  value={parentForm.name}
                  onChange={e => setParentForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className="border p-2 w-full"
                  type="password"
                  placeholder="Password"
                  value={parentForm.password}
                  onChange={e => setParentForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <Button type="submit" disabled={loadingParent}>Create Parent</Button>
                {errorParent && <div className="text-red-500 text-sm">{errorParent.message}</div>}
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {successMsg && <div className="text-green-600 font-medium">{successMsg}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Upcoming school events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.events?.slice(0, 3).map((event: any) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
})
