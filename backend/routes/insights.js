const express = require('express');
const app = express.Router();
const User = require('../models/User');
const axios = require('axios');


const goalIndexMap = {
    'Muscle Gain (Hypertrophy)': 'GoalA',
    'Fat Loss / Weight Loss': 'GoalB',
    'Strength Building': 'GoalC',
    'Endurance Improvement': 'GoalD',
    'Flexibility & Mobility': 'GoalE',
    'Athletic Performance': 'GoalF',
    'General Health & Longevity': 'GoalG',
    'Mental Wellness & Stress Relief': 'GoalH'
};

function goalsToVector(goals) {
    const vector = {
        goal_A: 0, goal_B: 0, goal_C: 0, goal_D: 0,
        goal_E: 0, goal_F: 0, goal_G: 0, goal_H: 0
    };

    goals.forEach(goal => {
        const key = goalIndexMap[goal];
        if (key) vector[key] = 1;
    });

    return vector;
}


app.post('/:id', async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const remField = goalsToVector(user.profile.fitnessGoals)
        const response = await axios.post('http://localhost:8000/predict/', { age: user.profile.age, height: user.profile.height, weight: user.profile.weight, target_weight: user.profile.targetWeight, ...remField });
        res.json(response.data);
    } catch (error) {
        console.error('Error making prediction:', error.message);
        res.status(500).send(`Error making prediction: ${error.message}`);
    }
});
module.exports = app;