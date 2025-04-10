# FitnessApp

## Overview

This backend system powers a fitness tracking application, leveraging AI to provide personalized fitness recommendations, track user activities, and monitor progress. It offers a robust API for managing users, logging workouts, setting fitness goals, and delivering AI-driven insights.

---

## Features

### User Management
- User registration and login.
- Encrypted password storage.
- User profiles include age, weight, height, and fitness goals.

### Activity Tracking
- Log fitness activities (e.g., running, cycling, weightlifting).
- Each activity includes:
  - **Activity Type:** Exercise type.
  - **Duration:** Time spent.
  - **Calories Burned:** Estimated energy expenditure.
  - **Timestamp:** Activity date and time.

### Goal Setting
- Set and update fitness goals (e.g., weight loss, muscle gain, distance running).

### AI-Driven Insights
- Personalized workout recommendations.
- Progress tracking toward fitness goals.
- Motivational feedback based on user activity.

### Data Visualization
- Endpoints for retrieving activity data for visualization (e.g., charts of calories burned or workouts logged).

---

## Technical Stack

- **Backend Frameworks:**
  - Node.js (Express) for core APIs.
  - FastAPI (Python) for AI model inference.
- **Database:** MongoDB.
- **Machine Learning Model:** XGBoost for workout classification.

---

## Machine Learning Details

The AI model is built to classify workouts based on user activity data. Key details:
1. **Dataset:** `fitness_tracker_dataset.csv`
2. **Preprocessing:**
   - Features: Exclude `gender`, `duration`, `calories_burned`, `intensity`, `workout_type`, and `calories_intake`.
   - Target: `workout_type`.
   - Standardized using `StandardScaler`.
3. **Model:** XGBoost Classifier with hyperparameters:
   - `n_estimators=100`
   - `max_depth=5`
   - `learning_rate=0.1`
4. **Accuracy:** Achieved significant training and testing accuracy after model evaluation.

Refer to the `main.py` file for implementation details.

---

## Installation and Setup

### Prerequisites
- Python 3.9+
- Node.js 14+
- MongoDB

### Steps
1. Clone the repository.
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install Node.js dependencies:
   ```bash
   npm install
   ```
4. Navigate to the FastAPI service:
   ```bash
   cd fastapi-service
   ```
5. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
6. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
7. Start the Node.js backend:
   ```bash
   npm start
   ```
8. Start the FastAPI service:
   ```bash
   uvicorn main:app --reload
   ```

---

## API Endpoints

### Node.js API
- **POST /users:** Create a new user.
- **GET /users/:id:** Retrieve user profile.
- **POST /activities:** Log a fitness activity.
- **GET /activities/:id:** Retrieve activity logs.
- **POST /goals:** Set/update fitness goals.
- **GET /insights/:id:** Get AI-driven insights.

### FastAPI Service
- **POST /predict:** Classify workout type using the AI model.

---

## Contributing
Contributions are welcome! Please ensure to follow standard practices when adding features or fixing issues.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Let me know if you'd like modifications!
