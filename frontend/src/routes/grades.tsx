"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, BookOpen, TrendingUp, Award } from "lucide-react"

const GET_STUDENTS_FOR_GRADES = gql`
  query GetStudentsForGrades {
    students {
      id
      name
      grade
      grades {
        id
        subject
        score
        maxScore
        createdAt
        teacher {
          name
        }
      }
    }
  }
`

const CREATE_GRADE = gql`
  mutation CreateGrade($subject: String!, $score: Float!, $maxScore: Float!, $studentId: String!) {
    createGrade(subject: $subject, score: $score, maxScore: $maxScore, studentId: $studentId) {
      id
      subject
      score
      maxScore
      student {
        name
      }
    }
  }
`

function Grades() {
  const { user } = useAuthStore()
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGrade, setNewGrade] = useState({
    subject: "",
    score: "",
    maxScore: "100",
    studentId: "",
  })

  const { data, loading, error, refetch } = useQuery(GET_STUDENTS_FOR_GRADES)
  const [createGrade, { loading: creating }] = useMutation(CREATE_GRADE, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewGrade({ subject: "", score: "", maxScore: "100", studentId: "" })
      refetch()
    },
  })

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createGrade({
        variables: {
          ...newGrade,
          score: Number.parseFloat(newGrade.score),
          maxScore: Number.parseFloat(newGrade.maxScore),
        },
      })
    } catch (err) {
      console.error("Error creating grade:", err)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading grades...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  const students = data?.students || []
  const selectedStudentData = students.find((s: any) => s.id === selectedStudent)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades Management</h1>
          <p className="text-gray-600">View and manage student grades</p>
        </div>
        {(user?.role === "TEACHER" || user?.role === "ADMIN") && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Grade</CardTitle>
            <CardDescription>Record a new grade for a student</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={newGrade.studentId}
                  onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  value={newGrade.subject}
                  onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Score</label>
                  <Input
                    type="number"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
                    placeholder="85"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Score</label>
                  <Input
                    type="number"
                    value={newGrade.maxScore}
                    onChange={(e) => setNewGrade({ ...newGrade, maxScore: e.target.value })}
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Adding..." : "Add Grade"}
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
            <CardDescription>Select a student to view grades</CardDescription>
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
                  <div className="text-xs text-gray-500">{student.grades.length} grades recorded</div>
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
                  <BookOpen className="w-5 h-5 mr-2" />
                  {selectedStudentData.name}'s Grades
                </CardTitle>
                <CardDescription>{selectedStudentData.grade}</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStudentData.grades.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStudentData.grades.map((grade: any) => {
                      const percentage = (grade.score / grade.maxScore) * 100
                      return (
                        <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{grade.subject}</div>
                              <div className="text-sm text-gray-600">By {grade.teacher.name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(grade.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {grade.score}/{grade.maxScore}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                percentage >= 80
                                  ? "text-green-600"
                                  : percentage >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No grades yet</h3>
                    <p className="text-gray-600">Grades will appear here once they are added.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student from the list to view their grades.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/grades")({
  component: Grades,
})
