import { Button } from "@/components/ui/button"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react"

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

function Dashboard() {
  const { user } = useAuthStore()
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA)

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
