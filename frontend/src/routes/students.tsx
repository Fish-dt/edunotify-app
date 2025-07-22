"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, User, BookOpen, AlertCircle } from "lucide-react"

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      name
      grade
      parent {
        id
        name
        email
      }
    }
  }
`

const CREATE_STUDENT = gql`
  mutation CreateStudent($name: String!, $grade: String!, $parentId: String!) {
    createStudent(name: $name, grade: $grade, parentId: $parentId) {
      id
      name
      grade
      parent {
        name
        email
      }
    }
  }
`

const GET_PARENTS = gql`
  query GetParents {
    parents: students {
      parent {
        id
        name
        email
      }
    }
  }
`

function Students() {
  const { user } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    grade: "",
    parentId: "",
  })

  const { data, loading, error, refetch } = useQuery(GET_STUDENTS)
  const [createStudent, { loading: creating }] = useMutation(CREATE_STUDENT, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewStudent({ name: "", grade: "", parentId: "" })
      refetch()
    },
  })

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createStudent({
        variables: newStudent,
      })
    } catch (err) {
      console.error("Error creating student:", err)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading students...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  // Only admins and teachers can access this page
  if (user?.role === "PARENT") {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-gray-600">This page is only available to teachers and administrators.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student information and records</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
            <CardDescription>Create a new student record</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <Input
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <Input
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  placeholder="e.g., Grade 8"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent ID</label>
                <Input
                  value={newStudent.parentId}
                  onChange={(e) => setNewStudent({ ...newStudent, parentId: e.target.value })}
                  placeholder="Enter parent user ID"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Student"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.students?.map((student: any) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>{student.grade}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  Parent: {student.parent.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Email: {student.parent.email}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  View Grades
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Add Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.students?.length === 0 && (
        <div className="text-center p-8">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Get started by adding your first student.</p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/students")({
  component: Students,
})
