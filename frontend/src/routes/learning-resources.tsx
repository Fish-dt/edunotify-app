"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { BookOpen, ExternalLink, Star, TrendingUp } from "lucide-react"

const GET_LEARNING_RESOURCES = gql`
  query GetLearningResources($studentId: ID!) {
    learningResources(studentId: $studentId) {
      id
      title
      description
      url
      subject
      difficulty
    }
  }
`

const GET_MY_CHILDREN = gql`
  query GetMyChildren {
    myChildren {
      id
      name
      grade
      grades {
        id
        subject
        score
        maxScore
      }
    }
  }
`

function LearningResources() {
  const { user } = useAuthStore()
  const [selectedStudent, setSelectedStudent] = useState("")

  const { data: childrenData, loading: childrenLoading } = useQuery(GET_MY_CHILDREN, {
    skip: user?.role !== "PARENT",
  })

  const { data: resourcesData, loading: resourcesLoading } = useQuery(GET_LEARNING_RESOURCES, {
    variables: { studentId: selectedStudent },
    skip: !selectedStudent,
  })

  if (user?.role !== "PARENT") {
    return (
      <div className="text-center p-8">
        <BookOpen className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Parent Access Only</h2>
        <p className="text-gray-600">Learning resources are available for parents to help their children.</p>
      </div>
    )
  }

  if (childrenLoading) return <div className="flex justify-center p-8">Loading...</div>

  const children = childrenData?.myChildren || []
  const resources = resourcesData?.learningResources || []
  const selectedChild = children.find((child: any) => child.id === selectedStudent)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "basic":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
        <p className="text-gray-600">AI-powered learning suggestions based on your child's performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Children</CardTitle>
            <CardDescription>Select a child to view personalized resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {children.map((child: any) => {
                const averageScore =
                  child.grades.length > 0
                    ? child.grades.reduce((sum: number, grade: any) => sum + (grade.score / grade.maxScore) * 100, 0) /
                      child.grades.length
                    : 0

                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedStudent(child.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedStudent === child.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{child.name}</div>
                    <div className="text-sm text-gray-600">{child.grade}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Average: {averageScore.toFixed(1)}%
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedChild ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learning Resources for {selectedChild.name}
                </CardTitle>
                <CardDescription>Personalized recommendations based on recent performance</CardDescription>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="text-center p-8">Loading resources...</div>
                ) : resources.length > 0 ? (
                  <div className="space-y-4">
                    {resources.map((resource: any) => (
                      <div key={resource.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{resource.description}</p>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-blue-600">{resource.subject}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(resource.difficulty)}`}
                              >
                                {resource.difficulty}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Open
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
                    <p className="text-gray-600">
                      Resources will be generated based on your child's grades and performance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Your Child</h3>
                <p className="text-gray-600">Choose one of your children to view personalized learning resources.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/learning-resources")({
  component: LearningResources,
})
