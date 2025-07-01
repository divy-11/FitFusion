"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Activity, ArrowRight, ArrowLeft, Sparkles, Target, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/axios"

interface OnboardingData {
  age: string
  weight: string
  height: string
  fitnessGoal: string
  activityLevel: string
  onboardingCompleted: boolean
}
const goalMap: Record<string, string> = {
  "weight_loss": "Fat Loss / Weight Loss",
  "muscle_gain": "Muscle Gain (Hypertrophy)",
  "endurance": "Endurance Improvement",
  "strength": "Strength Building",
  "general_fitness": "General Health & Longevity",
}
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userName, setUserName] = useState("")
  const [data, setData] = useState<OnboardingData>({
    age: "",
    weight: "",
    height: "",
    fitnessGoal: "",
    activityLevel: "",
    onboardingCompleted: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) {
      setUserName(name.split(" ")[0]) // Use first name only
    }
  }, [])

  const steps = [
    {
      id: "welcome",
      title: `Hey ${userName}! 👋`,
      subtitle: "Let's personalize your fitness journey",
      icon: Sparkles,
    },
    {
      id: "basics",
      title: "Tell us about yourself",
      subtitle: "This helps us create the perfect plan for you",
      icon: User,
    },
    {
      id: "goals",
      title: "What's your main goal?",
      subtitle: "We'll tailor everything around this",
      icon: Target,
    },
    {
      id: "activity",
      title: "How active are you currently?",
      subtitle: "Be honest - we're here to help, not judge!",
      icon: Activity,
    },
  ]

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      const token = localStorage.getItem("token")
      const mappedGoal = goalMap[data.fitnessGoal]
      const response = await api.put(`/users/${userId}`, {
        age: Number.parseInt(data.age),
        weight: Number.parseFloat(data.weight),
        height: Number.parseFloat(data.height),
        fitnessGoals: mappedGoal,
        activityLevel: data.activityLevel,
        onboardingCompleted: true
      }, {
        headers: {
          Authorization: `${token}`,
        },
      })


      if (response.status == 200) {
        console.log(response.data);
        toast({
          title: "Welcome to FitFusion! 🎉",
          description: "Your personalized fitness journey starts now!",
        })
        router.push("/dashboard")
      } else {
        throw new Error("Failed to complete onboarding")
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Don't worry, you can update this later in your profile.",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true
      case 1:
        return data.age && data.weight && data.height
      case 2:
        return data.fitnessGoal
      case 3:
        return data.activityLevel
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your fitness journey!</h2>
              <p className="text-gray-600">
                We're excited to help you reach your goals. This will only take 2 minutes, and we promise it's worth it!
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Why we ask:</strong> Personalized recommendations work 3x better than generic ones!
              </p>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">A few quick details</h2>
              <p className="text-gray-600">This helps us calculate your personalized recommendations</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={data.age}
                  onChange={(e) => setData((prev) => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={data.weight}
                  onChange={(e) => setData((prev) => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="175"
                value={data.height}
                onChange={(e) => setData((prev) => ({ ...prev, height: e.target.value }))}
              />
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">What's your main goal?</h2>
              <p className="text-gray-600">Don't worry, you can always change this later</p>
            </div>

            <div className="space-y-3">
              {[
                { value: "weight_loss", label: "Lose Weight", emoji: "🔥", desc: "Burn calories and shed pounds" },
                { value: "muscle_gain", label: "Build Muscle", emoji: "💪", desc: "Get stronger and more defined" },
                { value: "endurance", label: "Improve Endurance", emoji: "🏃", desc: "Run longer, feel better" },
                { value: "strength", label: "Get Stronger", emoji: "🏋️", desc: "Lift heavier, feel powerful" },
                {
                  value: "general_fitness",
                  label: "Stay Healthy",
                  emoji: "✨",
                  desc: "Overall wellness and energy",
                },
              ].map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setData((prev) => ({ ...prev, fitnessGoal: goal.value }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${data.fitnessGoal === goal.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-sm text-gray-600">{goal.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">How active are you?</h2>
              <p className="text-gray-600">This helps us recommend the right intensity</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "sedentary",
                  label: "Just Starting Out",
                  emoji: "🌱",
                  desc: "Little to no exercise",
                },
                {
                  value: "lightly_active",
                  label: "Somewhat Active",
                  emoji: "🚶",
                  desc: "Light exercise 1-3 days/week",
                },
                {
                  value: "moderately_active",
                  label: "Moderately Active",
                  emoji: "🏃",
                  desc: "Moderate exercise 3-5 days/week",
                },
                {
                  value: "very_active",
                  label: "Very Active",
                  emoji: "💪",
                  desc: "Hard exercise 6-7 days/week",
                },
                {
                  value: "extremely_active",
                  label: "Athlete Level",
                  emoji: "🏆",
                  desc: "Very hard exercise, physical job",
                },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setData((prev) => ({ ...prev, activityLevel: level.value }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${data.activityLevel === level.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{level.emoji}</span>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button onClick={handleNext} disabled={!canProceed() || isLoading} className="flex items-center space-x-2">
              <span>
                {currentStep === totalSteps - 1 ? (isLoading ? "Setting up..." : "Complete Setup") : "Continue"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Skip Option */}
          {currentStep > 0 && (
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip for now (you can complete this later)
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
