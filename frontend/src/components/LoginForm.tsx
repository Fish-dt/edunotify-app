"use client"

import type React from "react"
import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { useRouter } from "@tanstack/react-router"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const [login, { loading }] = useMutation(LOGIN_MUTATION)
  const { login: setAuth } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const { data } = await login({
        variables: { email, password },
      })

      setAuth(data.login.token, data.login.user)
      router.navigate({ to: "/dashboard" })
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">EduNotify</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p className="font-medium">Demo Accounts:</p>
            <div className="mt-2 space-y-1">
              <p>Admin: admin@edunotify.com / admin123</p>
              <p>Teacher: teacher@edunotify.com / teacher123</p>
              <p>Parent: parent@edunotify.com / parent123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
