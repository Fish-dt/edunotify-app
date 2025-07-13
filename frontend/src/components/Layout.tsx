"use client"

import type React from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, User, BookOpen, Calendar, Users } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.navigate({ to: "/login" })
  }

  if (!user) {
    return <div>{children}</div>
  }

  const navigationItems = [
    { to: "/dashboard", label: "Dashboard", icon: BookOpen },
    { to: "/events", label: "Events", icon: Calendar },
    ...(user.role === "ADMIN" || user.role === "TEACHER" ? [{ to: "/students", label: "Students", icon: Users }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                EduNotify
              </Link>
              <div className="ml-10 flex space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    activeProps={{ className: "text-blue-600" }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                {user.name} ({user.role})
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
