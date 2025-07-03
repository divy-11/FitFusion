"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Edit, Trash2, Calendar, TrendingUp } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/axios"
import { useRouter } from "next/navigation"

interface Goal {
  _id: string
  title: string
  description: string
  fitnessGoal: string
  targetValue: number
  currentValue: number
  unit: string
  targetDate: string
  status: "active" | "completed" | "paused"
  createdAt: string
}

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fitnessGoal: "",
    targetValue: "",
    unit: "",
    targetDate: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await api.get(`/goals`, {
        headers: {
          Authorization: `${token}`,
        },
        validateStatus: () => true
      })

      if (response.status == 200) {
        const data = response.data
        console.log(data);
        setGoals(data.goals)
      }
      else if (response.status == 401) {
        toast({
          title: "Unauthorized Access",
          description: "Please login first.",
          variant: "destructive",
        });
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      const goalData = {
        title: formData.title,
        description: formData.description,
        fitnessGoal: formData.fitnessGoal,
        targetValue: Number.parseFloat(formData.targetValue),
        currentValue: 0,
        unit: formData.unit,
        targetDate: formData.targetDate,
        status: "active" as const,
      }

      const url = editingGoal ? `/goals/${editingGoal._id}` : "/goals"
      const method = editingGoal ? "put" : "post";

      const response = await api[method](url,
        goalData, {
        headers: {
          Authorization: `${token}`,
        },
      }
      )
      if (response.status == 200 || response.status == 201) {
        await fetchGoals()
        resetForm()
        toast({
          title: editingGoal ? "Goal updated" : "Goal created",
          description: `Your fitness goal has been ${editingGoal ? "updated" : "created"} successfully.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      fitnessGoal: "",
      targetValue: "",
      unit: "",
      targetDate: "",
    })
    setShowCreateForm(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)

    setFormData({
      title: goal.title,
      description: goal.description,
      fitnessGoal: goal.fitnessGoal,
      targetValue: goal.targetValue.toString(),
      unit: goal.unit,
      targetDate: goal.targetDate.split("T")[0], // Format for date input
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await api.delete(`/goals/${goalId}`, {
        headers: {
          Authorization: `${token}`,
        },
      })

      if (response.status == 200) {
        await fetchGoals()
        toast({
          title: "Goal deleted",
          description: "Your goal has been deleted successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const deadlineDate = new Date(targetDate)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
            <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
            <p className="text-gray-600">Set and track your fitness objectives</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</CardTitle>
              <CardDescription>
                {editingGoal ? "Update your fitness goal" : "Set a new fitness goal to track your progress"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Lose 10kg"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fitnessGoal">Goal Type</Label>
                    <Select
                      value={formData.fitnessGoal}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, fitnessGoal: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="weight_gain">Weight Gain</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="frequency">Frequency</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10"
                      value={formData.targetValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetValue: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="km">Kilometers</SelectItem>
                        <SelectItem value="miles">Miles</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="reps">Repetitions</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Deadline</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal and motivation..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit">{editingGoal ? "Update Goal" : "Create Goal"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.currentValue, goal.targetValue)
            const daysRemaining = getDaysRemaining(goal.targetDate)

            return (
              <Card key={goal._id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{goal.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                            ? "Due today"
                            : `${Math.abs(daysRemaining)} days overdue`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{goal.fitnessGoal.replace("_", " ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {goals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set yet</h3>
              <p className="text-gray-600 mb-6">Create your first fitness goal to start tracking your progress</p>
              <Button onClick={() => setShowCreateForm(true)}>Create Your First Goal</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
