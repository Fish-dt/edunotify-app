"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, User, Mail, Shield, Trash2, Edit } from "lucide-react"

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      role
      createdAt
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $password: String!, $name: String!, $role: Role!) {
    createUser(email: $email, password: $password, name: $name, role: $role) {
      id
      email
      name
      role
    }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

function Users() {
  const { user } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "TEACHER" as "ADMIN" | "TEACHER" | "PARENT",
  })

  const { data, loading, error, refetch } = useQuery(GET_USERS)
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewUser({ email: "", password: "", name: "", role: "TEACHER" })
      refetch()
    },
  })

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => refetch(),
  })

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser({
        variables: newUser,
      })
    } catch (err) {
      console.error("Error creating user:", err)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser({ variables: { id: userId } })
      } catch (err) {
        console.error("Error deleting user:", err)
      }
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="text-center p-8">
        <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
        <p className="text-gray-600">This page is only available to administrators.</p>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center p-8">Loading users...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  const users = data?.users || []

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "TEACHER":
        return "bg-blue-100 text-blue-800"
      case "PARENT":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="PARENT">Parent</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
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
        {users.map((userData: any) => (
          <Card key={userData.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{userData.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {userData.email}
                    </CardDescription>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userData.role)}`}>{userData.role}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Created: {new Date(userData.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {userData.id !== user?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDeleteUser(userData.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center p-8">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Get started by adding your first user.</p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/users")({
  component: Users,
})
