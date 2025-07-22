"use client"

import type React from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, gql } from "@apollo/client"
import { useAuthStore } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, Calendar, Clock, User } from "lucide-react"

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      title
      description
      date
      creator {
        name
        role
      }
      createdAt
    }
  }
`

const CREATE_EVENT = gql`
  mutation CreateEvent($title: String!, $description: String!, $date: String!) {
    createEvent(title: $title, description: $description, date: $date) {
      id
      title
      description
      date
      creator {
        name
      }
    }
  }
`

function Events() {
  const { user } = useAuthStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  })

  const { data, loading, error, refetch } = useQuery(GET_EVENTS)
  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      setShowAddForm(false)
      setNewEvent({ title: "", description: "", date: "" })
      refetch()
    },
  })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEvent({
        variables: {
          ...newEvent,
          date: new Date(newEvent.date).toISOString(),
        },
      })
    } catch (err) {
      console.error("Error creating event:", err)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading events...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>

  const events = data?.events || []
  const upcomingEvents = events.filter((event: any) => new Date(event.date) >= new Date())
  const pastEvents = events.filter((event: any) => new Date(event.date) < new Date())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Events</h1>
          <p className="text-gray-600">Stay updated with school activities and announcements</p>
        </div>
        {(user?.role === "TEACHER" || user?.role === "ADMIN") && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>Add a new school event or announcement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Parent-Teacher Conference"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event details and information..."
                  className="w-full p-2 border rounded-md h-24 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Event"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Events scheduled for the future</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {event.creator.name} ({event.creator.role})
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Upcoming</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600">New events will appear here when they are scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Past Events
            </CardTitle>
            <CardDescription>Previously held events</CardDescription>
          </CardHeader>
          <CardContent>
            {pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {event.creator.name}
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Past</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past events</h3>
                <p className="text-gray-600">Past events will be shown here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/events")({
  component: Events,
})
