from fastapi import FastAPI
from pydantic import BaseModel
import pickle
from sklearn.preprocessing import LabelEncoder
import numpy as np

app = FastAPI()

# Load your trained XGBoost model
with open("xgb_fitness_model.pkl", "rb") as f:
    model = pickle.load(f)

# Rebuild the label encoder (make sure this order matches training!)
label_encoder = LabelEncoder()
label_encoder.classes_ = np.array(['cycling', 'cardio', 'hiit', 'strength','yoga','running'])
avg_calories_map = {
    "cardio": 400,
    "strength": 300,
    "hiit": 500,
    "yoga": 180,
    "cycling": 350,
    "running": 450
}

# Input schema
class FitnessInput(BaseModel):
    age: int
    height: int  # in cm
    weight: int  # in kg
    target_weight: int 
    goal_A: int
    goal_B: int
    goal_C: int
    goal_D: int
    goal_E: int
    goal_F: int
    goal_G: int
    goal_H: int

# BMI category
def get_fitness_level(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    return "Obese"

# Workout motivation mapping
feedback_map = {
    "cardio": "Great for endurance and fat burn!",
    "strength": "Perfect for building muscle mass.",
    "yoga": "Excellent for flexibility and stress relief.",
    "hiit": "Fast, effective, and intense. Go crush it!",
    "cycling": "Low-impact and fun for calorie burn.",
    "running": "Classic cardio – boost stamina and heart health."
}

# Root route
@app.get("/")
def root():
    return {"msg": "Heyyyy!"}

# Predict route
@app.post("/predict")
def predict_workout(data: FitnessInput):
    bmi = data.weight / ((data.height / 100) ** 2)

    # Feature order must match training
    input_features = [[
        data.age,
        data.height,
        data.weight,
        bmi,
        data.goal_A,
        data.goal_B,
        data.goal_C,
        data.goal_D,
        data.goal_E,
        data.goal_F,
        data.goal_G,
        data.goal_H
    ]]

    prediction_index = model.predict(input_features)[0]
    predicted_workout = label_encoder.inverse_transform([prediction_index])[0]
    calories_per_session = avg_calories_map.get(predicted_workout, 350)
    weight_diff = data.weight - data.target_weight
    if weight_diff <= 0:
        days_needed = 0
    else:
        total_calories_to_burn = weight_diff * 7700
        days_needed = int(total_calories_to_burn / calories_per_session)

    return {
    "bmi": round(bmi, 2),
    "fitness_level": get_fitness_level(bmi),
    "predicted_workout": predicted_workout,
    "motivational_tip": feedback_map.get(predicted_workout, "Keep going! 💪"),
    "goal_progress": {
        "current_weight": data.weight,
        "target_weight": data.target_weight,
        "weight_to_lose": max(0, round(weight_diff, 2)),
        "estimated_days_to_goal": days_needed
    }
}

