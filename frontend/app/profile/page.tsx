"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Edit, Save, X, Activity, Target, TrendingUp, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/axios"

interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  weight: number
  height: number
  fitnessGoal: string
  createdAt: string
}

interface UserStats {
  totalActivities: number
  totalCalories: number
  averageWorkoutDuration: number
  memberSince: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: "dummy-id",
    name: "dummy",
    email: "dummy@example.com",
    age: 0,
    weight: 0,
    height: 0,
    fitnessGoal: "general_fitness",
    createdAt: new Date().toISOString(),
  })
  const [stats, setStats] = useState<UserStats>({
    totalActivities: 0,
    totalCalories: 0,
    averageWorkoutDuration: 0,
    memberSince: new Date().toISOString(),
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    age: "",
    weight: "",
    height: "",
    fitnessGoal: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await api.get(`/users`, {
        headers: {
          Authorization: `${token}`,
        },
      })

      if (response.status == 200) {
        const data = response.data
        setProfile({
          id: data._id,
          name: data.name,
          email: data.email,
          age: data.profile.age,
          weight: data.profile.weight,
          height: data.profile.height,
          fitnessGoal: data.profile.fitnessGoals,
          createdAt: data.createdAt,
        })
        // console.log(data);

        setEditForm({
          age: data.profile.age.toString(),
          weight: data.profile.weight.toString(),
          height: data.profile.height.toString(),
          fitnessGoal: data.profile.fitnessGoals,
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      const resp = await api.get(`/activities`, {
        headers: {
          Authorization: `${token}`,
        },
      })

      if (resp.status == 201) {
        const activities = resp.data
        const totalActivities = activities.length
        const totalCalories = activities.reduce((sum: number, activity: any) => sum + activity.caloriesBurned, 0)
        const averageWorkoutDuration =
          activities.length > 0
            ? activities.reduce((sum: number, activity: any) => sum + activity.duration, 0) / activities.length
            : 0

        setStats({
          totalActivities,
          totalCalories,
          averageWorkoutDuration: Math.round(averageWorkoutDuration),
          memberSince: profile?.createdAt || new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")

      const response = await api.put(`/users`, {
        age: Number.parseInt(editForm.age),
        weight: Number.parseFloat(editForm.weight),
        height: Number.parseFloat(editForm.height),
        fitnessGoals: editForm.fitnessGoal,
        onboardingCompleted: true
      }, {
        headers: {
          Authorization: `${token}`,
        },
      },
      )

      if (response.status == 200) {
        await fetchProfile()
        setIsEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        age: profile.age.toString(),
        weight: profile.weight.toString(),
        height: profile.height.toString(),
        fitnessGoal: profile.fitnessGoal,
      })
    }
    setIsEditing(false)
  }

  const calculateBMI = () => {
    if (profile) {
      const heightInMeters = profile.height / 100
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return "0"
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "bg-blue-100 text-blue-800" }
    if (bmi < 25) return { category: "Normal", color: "bg-green-100 text-green-800" }
    if (bmi < 30) return { category: "Overweight", color: "bg-yellow-100 text-yellow-800" }
    return { category: "Obese", color: "bg-red-100 text-red-800" }
  }

  const getGoalBadgeColor = (goal: string) => {
    const colors: { [key: string]: string } = {
      weight_loss: "bg-red-100 text-red-800",
      muscle_gain: "bg-blue-100 text-blue-800",
      endurance: "bg-green-100 text-green-800",
      strength: "bg-purple-100 text-purple-800",
      general_fitness: "bg-gray-100 text-gray-800",
    }
    return colors[goal] || "bg-gray-100 text-gray-800"
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

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile data</p>
        </div>
      </DashboardLayout>
    )
  }

  const bmi = Number.parseFloat(calculateBMI())
  const bmiInfo = getBMICategory(bmi)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account and fitness information</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Email */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    {/* <AvatarImage src="/placeholder-user.svg?height=80&width=80" /> */}
                    <AvatarFallback className="text-3xl bg-blue-200">{profile.email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {profile.name}
                    </h3>
                    <p className="text-gray-700">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, age: e.target.value }))}
                      />
                    ) : (
                      <p className="text-lg font-medium">{profile.age} years</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    {isEditing ? (
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={editForm.weight}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}
                      />
                    ) : (
                      <p className="text-lg font-medium">{profile.weight} kg</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    {isEditing ? (
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={editForm.height}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, height: e.target.value }))}
                      />
                    ) : (
                      <p className="text-lg font-medium">{profile.height} cm</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.fitnessGoal}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, fitnessGoal: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="strength">Strength</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getGoalBadgeColor(profile.fitnessGoal)}>
                        {profile.fitnessGoal.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* BMI Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Body Mass Index (BMI)</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold">{calculateBMI()}</span>
                    <Badge className={bmiInfo.color}>{bmiInfo.category}</Badge>
                  </div>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-600">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Total Activities</span>
                      </div>
                      <span className="font-semibold">{stats.totalActivities}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Total Calories</span>
                      </div>
                      <span className="font-semibold">{stats.totalCalories.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Avg. Duration</span>
                      </div>
                      <span className="font-semibold">{stats.averageWorkoutDuration} min</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Member Since</span>
                      </div>
                      <span className="font-semibold">{new Date(stats.memberSince).getFullYear()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Preferences
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout >
  )
}
