"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, Target, TrendingUp, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

interface DashboardStats {
  totalActivities: number
  totalCalories: number
  weeklyGoalProgress: number
  currentStreak: number
}

interface RecentActivity {
  id: string
  type: string
  duration: number
  calories: number
  date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 0,
    totalCalories: 0,
    weeklyGoalProgress: 0,
    currentStreak: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      // Fetch user activities using the correct API endpoint
      const activitiesResponse = await fetch(`/api/activities/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json()

        // Calculate stats from activities
        const totalActivities = activities.length
        const totalCalories = activities.reduce((sum: number, activity: any) => sum + (activity.calories || 0), 0)

        // Calculate weekly goal progress (assuming goal of 5 activities per week)
        const thisWeek = activities.filter((activity: any) => {
          const activityDate = new Date(activity.timestamp || activity.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return activityDate >= weekAgo
        })
        const weeklyGoalProgress = Math.min((thisWeek.length / 5) * 100, 100)

        // Calculate current streak (simplified)
        const currentStreak = calculateStreak(activities)

        setStats({
          totalActivities,
          totalCalories,
          weeklyGoalProgress,
          currentStreak,
        })

        // Set recent activities (last 5)
        const sortedActivities = activities
          .sort(
            (a: any, b: any) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime(),
          )
          .slice(0, 5)

        setRecentActivities(sortedActivities)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to calculate streak
  const calculateStreak = (activities: any[]) => {
    if (activities.length === 0) return 0

    const sortedDates = activities
      .map((activity) => new Date(activity.timestamp || activity.date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date().toDateString()

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
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
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600">Here's your fitness overview for today</p>
          </div>
          <Link href="/activities/new">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Log Activity</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalories.toLocaleString()}</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.weeklyGoalProgress)}%</div>
              <Progress value={stats.weeklyGoalProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-gray-600">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.duration} minutes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.calories} cal</p>
                      <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Link href="/activities">
                  <Button variant="outline" className="w-full">
                    View All Activities
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No activities logged yet</p>
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
