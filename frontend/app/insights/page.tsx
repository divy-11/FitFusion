"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, TrendingUp, Target, Activity, RefreshCw, Zap, Award, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface Insight {
  id: string
  type: "recommendation" | "progress" | "motivation" | "achievement"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionable: boolean
  createdAt: string
}

interface WorkoutRecommendation {
  type: string
  duration: number
  intensity: string
  reason: string
}

interface ProgressAnalysis {
  metric: string
  current: number
  target: number
  trend: "improving" | "declining" | "stable"
  recommendation: string
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([])
  const [progressAnalysis, setProgressAnalysis] = useState<ProgressAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/insights/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setRecommendations(data.recommendations || [])
        setProgressAnalysis(data.progressAnalysis || [])
      } else {
        // Fallback with mock data if API is not available
        setMockData()
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
      setMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const setMockData = () => {
    // Mock data for demonstration
    setInsights([
      {
        id: "1",
        type: "recommendation",
        title: "Increase Cardio Frequency",
        description:
          "Based on your recent activities, adding 2 more cardio sessions per week could help you reach your weight loss goal faster.",
        priority: "high",
        actionable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "progress",
        title: "Great Progress This Week!",
        description: "You've burned 15% more calories this week compared to last week. Keep up the excellent work!",
        priority: "medium",
        actionable: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        type: "motivation",
        title: "Consistency Streak",
        description:
          "You're on a 5-day workout streak! Maintaining consistency is key to achieving your fitness goals.",
        priority: "medium",
        actionable: false,
        createdAt: new Date().toISOString(),
      },
    ])

    setRecommendations([
      {
        type: "HIIT Training",
        duration: 25,
        intensity: "High",
        reason: "Optimal for fat burning based on your current fitness level",
      },
      {
        type: "Strength Training",
        duration: 45,
        intensity: "Medium",
        reason: "Build muscle to increase your metabolic rate",
      },
      {
        type: "Yoga",
        duration: 30,
        intensity: "Low",
        reason: "Recovery and flexibility improvement",
      },
    ])

    setProgressAnalysis([
      {
        metric: "Weekly Calories Burned",
        current: 2100,
        target: 2500,
        trend: "improving",
        recommendation: "Add one more high-intensity workout to reach your target",
      },
      {
        metric: "Workout Frequency",
        current: 4,
        target: 5,
        trend: "stable",
        recommendation: "Try to add one more workout session per week",
      },
    ])
  }

  const refreshInsights = async () => {
    setIsRefreshing(true)
    await fetchInsights()
    setIsRefreshing(false)
    toast({
      title: "Insights refreshed",
      description: "Your AI insights have been updated with the latest data.",
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-yellow-600" />
      case "progress":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "motivation":
        return <Zap className="h-5 w-5 text-blue-600" />
      case "achievement":
        return <Award className="h-5 w-5 text-purple-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />
    }
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
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">Personalized recommendations and progress analysis</p>
          </div>
          <Button onClick={refreshInsights} disabled={isRefreshing} className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                  </div>
                  <Badge className={getPriorityColor(insight.priority)}>{insight.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{insight.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                  {insight.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workout Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recommended Workouts</span>
            </CardTitle>
            <CardDescription>AI-powered workout suggestions based on your goals and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{rec.type}</h4>
                    <Badge variant="outline">{rec.intensity}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Duration:</strong> {rec.duration} minutes
                    </p>
                    <p className="mt-2">{rec.reason}</p>
                  </div>
                  <Button size="sm" className="w-full">
                    Start Workout
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progress Analysis</span>
            </CardTitle>
            <CardDescription>Track your progress towards your fitness goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {progressAnalysis.map((analysis, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center space-x-2">
                      <span>{analysis.metric}</span>
                      {getTrendIcon(analysis.trend)}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {analysis.current} / {analysis.target}
                    </span>
                  </div>
                  <Progress value={(analysis.current / analysis.target) * 100} className="h-2" />
                  <p className="text-sm text-gray-600">{analysis.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Zap className="h-5 w-5" />
              <span>Stay Motivated!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">This Week's Achievement</h4>
                <p className="text-blue-700">
                  You've completed 85% of your weekly workout goal. Just one more session to go!
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Streak Counter</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">5 days workout streak 🔥</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
