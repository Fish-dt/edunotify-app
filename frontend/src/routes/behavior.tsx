"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, AlertCircle, CheckCircle, Minus, User } from "lucide-react"

const GET_STUDENTS_WITH_BEHAVIOR = gql`
  query GetStudentsWithBehavior {
    students {
      id
      name
      grade
      behaviorReports {
        id
        title
        description
        type
        createdAt
        teacher {
          name
        }
      }
    }
  }
`

const CREATE_BEHAVIOR_REPORT = gql`
  mutation CreateBehaviorReport($title: String!, $description: String!, $type: BehaviorType!, $studentId: String!) {
    createBehaviorReport(title: $title, description: $description, type: $type, studentId: $studentId) {
      id
      title
      description
      type
      student {
        name
      }
    }
  }
`

function BehaviorReports() {
  const { user } = useAuthStore()
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    type: "POSITIVE" as "POSITIVE" | "NEGATIVE" | "NEUTRAL",
    studentId: "",
  })

  const { data, loading, error, refetch } = useQuery(GET_STUDENTS_WITH_BEHAVIOR)
  const [createBehaviorReport, { loading: creating }] = useMutation(CREATE_BEHAVIOR_REPORT, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewReport({ title: "", description: "", type: "POSITIVE", studentId: "" })
      refetch()
    },
  })

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBehaviorReport({
        variables: newReport,
      })
    } catch (err) {
      console.error("Error creating behavior report:", err)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading behavior reports...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  const students = data?.students || []
  const selectedStudentData = students.find((s: any) => s.id === selectedStudent)

  const getBehaviorIcon = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "NEGATIVE":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Minus className="w-5 h-5 text-gray-600" />
    }
  }

  const getBehaviorColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "border-green-200 bg-green-50"
      case "NEGATIVE":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Behavior Reports</h1>
          <p className="text-gray-600">Track and manage student behavior</p>
        </div>
        {(user?.role === "TEACHER" || user?.role === "ADMIN") && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Report
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Behavior Report</CardTitle>
            <CardDescription>Record a behavior observation for a student</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={newReport.studentId}
                  onChange={(e) => setNewReport({ ...newReport, studentId: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Report Title</label>
                <Input
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="e.g., Excellent Participation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Detailed description of the behavior..."
                  className="w-full p-2 border rounded-md h-24 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Behavior Type</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="POSITIVE">Positive</option>
                  <option value="NEGATIVE">Negative</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Adding..." : "Add Report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Select a student to view behavior reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student: any) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStudent === student.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.grade}</div>
                  <div className="text-xs text-gray-500">{student.behaviorReports.length} reports</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedStudentData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {selectedStudentData.name}'s Behavior Reports
                </CardTitle>
                <CardDescription>{selectedStudentData.grade}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStudentData.behaviorReports.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStudentData.behaviorReports.map((report: any) => (
                      <div key={report.id} className={`p-4 border rounded-lg ${getBehaviorColor(report.type)}`}>
                        <div className="flex items-start space-x-3">
                          {getBehaviorIcon(report.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{report.title}</h3>
                              <span className="text-xs text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{report.description}</p>
                            <div className="text-sm text-gray-600">Reported by: {report.teacher.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                    <p className="text-gray-600">Behavior reports will appear here once they are added.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student from the list to view their behavior reports.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/behavior")({
  component: BehaviorReports,
})
