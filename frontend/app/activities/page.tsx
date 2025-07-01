"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { api } from "@/lib/axios"

interface ActivityLog {
  id: string
  activityType: string
  duration: number
  caloriesBurned: number
  timestamp: string
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, filterType])

  const fetchActivities = async () => {
    try {
      // const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      const response = await api.get(`/activities`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      console.log(response);

      if (response.status == 201) {
        setActivities(response.data)
        console.log(activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    if (searchTerm) {
      filtered = filtered.filter((activity) => activity.activityType.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterType !== "all") {
      filtered = filtered.filter((activity) => activity.activityType === filterType)
    }

    setFilteredActivities(filtered)
  }

  const getActivityIcon = (type: string) => {
    // You can customize icons based on activity type
    return <Activity className="h-5 w-5 text-blue-600" />
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600">Track and manage your workout history</p>
          </div>
          <Link href="/activities/new">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Log Activity</span>
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="weightlifting">Weightlifting</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>{filteredActivities.length} activities found</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{activity.activityType}</h3>
                        <p className="text-sm text-gray-600">
                          {activity.duration} minutes • {activity.caloriesBurned} calories
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">{activity.caloriesBurned} cal</div>
                      <div className="text-sm text-gray-600">{activity.duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start logging your workouts to see them here"}
                </p>
                <Link href="/activities/new">
                  <Button>Log Your First Activity</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
