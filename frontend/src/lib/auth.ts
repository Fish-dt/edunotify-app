import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "TEACHER" | "PARENT"
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        localStorage.setItem("token", token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem("token")
        set({ user: null, token: null, isAuthenticated: false })
      },
      initialize: () => {
        const token = localStorage.getItem("token")
        const state = get()
        if (token && state.user) {
          set({ token, isAuthenticated: true })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // Only persist user, not token
    },
  ),
)
