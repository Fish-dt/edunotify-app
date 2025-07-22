import React from "react"
import ReactDOM from "react-dom/client"
import { ApolloProvider } from "@apollo/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { apolloClient } from "./lib/apollo"
import { useAuthStore } from "./lib/auth"
import { routeTree } from "./routeTree.gen"
import "./index.css"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Initialize auth store
useAuthStore.getState().initialize()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
)
