"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/axios"

export default function NewActivityPage() {
  const [formData, setFormData] = useState({
    type: "",
    duration: "",
    calories: "",
    customField: "0",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [useAIPrediction, setUseAIPrediction] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [distanceCol, setDistanceCol] = useState(false)
  const [weightCol, setWeightCol] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field == 'type') {
      if (value == 'weightlifting') {
        setWeightCol(true)
        setDistanceCol(false)
      }
      else if (value == 'running' || value == 'hiking' || value == 'walking' || value == 'cycling') {
        setDistanceCol(true)
        setWeightCol(false)
      }
      else {
        setWeightCol(false)
        setDistanceCol(false)
      }
    }
  }

  const predictWorkoutType = async () => {
    if (!formData.duration || !formData.calories) {
      toast({
        title: "Missing information",
        description: "Please enter duration and calories to use AI prediction.",
        variant: "destructive",
      })
      return
    }

    setUseAIPrediction(true)
    try {
      // Use your FastAPI endpoint for workout prediction
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: Number.parseInt(formData.duration),
          calories_burned: Number.parseInt(formData.calories),
          // Add other features your model expects
          age: 25, // You might want to get this from user profile
          weight: 70, // You might want to get this from user profile
          height: 175, // You might want to get this from user profile
          intensity: "medium", // Default or let user select
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, type: data.predicted_workout_type || data.prediction }))
        toast({
          title: "AI Prediction Complete",
          description: `Predicted workout type: ${data.predicted_workout_type || data.prediction}`,
        })
      }
    } catch (error) {
      toast({
        title: "Prediction failed",
        description: "Unable to predict workout type. Please select manually.",
        variant: "destructive",
      })
    } finally {
      setUseAIPrediction(false)
    }
  }
  const updateGoals = async () => {
    const token = localStorage.getItem("token")

    const response = await api.put(`/goals/all`, {
      activityType: formData.type,
      duration: Number.parseInt(formData.duration),
      customField: Number.parseInt(formData.customField),
      caloriesBurned: Number.parseInt(formData.calories),
    }, {
      headers: {
        Authorization: `${token}`,
      },
      validateStatus: () => true
    })
    if (response.status == 200) {
      return true
    }
    return false
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!updateGoals()) return;
      const token = localStorage.getItem("token")
      // const userId = localStorage.getItem("userId")

      const response = await api.post("/activities", {
        // userId: userId,
        activityType: formData.type,
        duration: Number.parseInt(formData.duration),
        customField: Number.parseInt(formData.customField),
        caloriesBurned: Number.parseInt(formData.calories),
        timestamp: new Date().toISOString(),
        notes: formData.notes,
      }, {
        headers: {
          Authorization: `${token}`,
        },
        validateStatus: () => true
      })
      console.log(response.status);

      if (response.status == 201) {
        toast({
          title: "Activity logged successfully",
          description: "Your workout has been added to your activity history.",
        })
        router.push("/activities")
      }
      else if (response.status == 401) {
        toast({
          title: "Unauthorized Access",
          description: "Please login first.",
          variant: "destructive",
        });
        router.push("/login")
      }
      else if (response.status == 403) {
        toast({
          title: "Session Expired.",
          description: "Please login again.",
          variant: "destructive",
        });
        router.push("/login")
      } else {
        throw new Error("Failed to log activity")
      }
    } catch (error) {
      toast({
        title: "Failed to log activity",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/activities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log New Activity</h1>
            <p className="text-gray-600">Record your latest workout session</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activity Details</span>
            </CardTitle>
            <CardDescription>Fill in the details of your workout session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="type">Activity Type</Label>
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={predictWorkoutType}
                    disabled={useAIPrediction || !formData.duration || !formData.calories}
                  >
                    {useAIPrediction ? "Predicting..." : "AI Predict"}
                  </Button> */}
                </div>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="workout">Workout (Gym)</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                    <SelectItem value="weightlifting">Weightlifting</SelectItem>
                    <SelectItem value="swimming">Swimming</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="hiking">Hiking</SelectItem>
                    <SelectItem value="dancing">Dancing</SelectItem>
                    <SelectItem value="boxing">Boxing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={`grid grid-cols-1 gap-6 ${distanceCol || weightCol ? "md:grid-cols-3" : "md:grid-cols-2"
                }`}>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    required
                  />
                </div>
                {distanceCol && (
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance Covered (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="e.g., 5.2"
                      value={formData.customField || ""}
                      onChange={(e) => handleInputChange("customField", e.target.value)}
                      required
                    />
                  </div>
                )}

                {weightCol && (
                  <div className="space-y-2">
                    <Label htmlFor="maxWeight">Max Weight Lifted (kg)</Label>
                    <Input
                      id="maxWeight"
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.customField || ""}
                      onChange={(e) => handleInputChange("customField", e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories Burned</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="e.g., 250"
                    value={formData.calories}
                    onChange={(e) => handleInputChange("calories", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about your workout..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Logging Activity..." : "Log Activity"}
                </Button>
                <Link href="/activities">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
