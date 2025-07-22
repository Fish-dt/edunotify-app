"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, BookOpen, User, Code, Trash2, Edit } from "lucide-react"

const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      code
      description
      teacher {
        id
        name
        email
      }
      createdAt
    }
    teachers {
      id
      name
      email
    }
  }
`

const CREATE_COURSE = gql`
  mutation CreateCourse($name: String!, $code: String!, $description: String!, $teacherId: String!) {
    createCourse(name: $name, code: $code, description: $description, teacherId: $teacherId) {
      id
      name
      code
      description
      teacher {
        name
      }
    }
  }
`

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`

function Courses() {
  const { user } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    teacherId: "",
  })

  const { data, loading, error, refetch } = useQuery(GET_COURSES)
  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewCourse({ name: "", code: "", description: "", teacherId: "" })
      refetch()
    },
  })

  const [deleteCourse] = useMutation(DELETE_COURSE, {
    onCompleted: () => refetch(),
  })

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCourse({
        variables: newCourse,
      })
    } catch (err) {
      console.error("Error creating course:", err)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse({ variables: { id: courseId } })
      } catch (err) {
        console.error("Error deleting course:", err)
      }
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading courses...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  const courses = data?.courses || []
  const teachers = data?.teachers || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Manage school courses and assignments</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
            <CardDescription>Create a new course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name</label>
                  <Input
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    placeholder="e.g., Mathematics Grade 8"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Code</label>
                  <Input
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                    placeholder="e.g., MATH8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Course description..."
                  className="w-full p-2 border rounded-md h-24 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Teacher</label>
                <select
                  value={newCourse.teacherId}
                  onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
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
        {courses.map((course: any) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Code className="w-3 h-3 mr-1" />
                      {course.code}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{course.description}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  Teacher: {course.teacher.name}
                </div>
                <div className="text-xs text-gray-500">Created: {new Date(course.createdAt).toLocaleDateString()}</div>
              </div>
              {user?.role === "ADMIN" && (
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center p-8">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Get started by adding your first course.</p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/courses")({
  component: Courses,
})
