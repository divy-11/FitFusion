const express = require('express');
const app = express.Router();
const z = require('zod');
const Goal = require('../models/Goal');
const authUser = require('../middleware/middleware');

const goalSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    fitnessGoal: z.string().min(1, "Fitness goal is required"),
    targetValue: z.number(),
    currentValue: z.number().default(0),
    unit: z.string().min(1, "Unit is required"),
    status: z.enum(["active", "completed", "paused"]).default("active"),
    targetDate: z.string(),
});


app.post('/', authUser, async (req, res) => {
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    console.log({ userId: req.user.id, ...req.body });
    const result = goalSchema.safeParse({ userId: req.user.id, ...req.body });
    if (!result.success) {
        console.log(result.error.flatten().fieldErrors);

        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const goal = await Goal.create(result.data)
        res.status(201).json({ msg: 'Goal set successfully', goal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put('/solo/:id', authUser, async (req, res) => {
    // console.log(req.user);
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    const result = goalSchema.safeParse({ userId: req.user.id, ...req.body });
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    try {
        const goal = await Goal.findByIdAndUpdate(req.params.id, result.data, { new: true })
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.status(200).json({ msg: 'Goal updated successfully', goal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/all', authUser, async (req, res) => {
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    const { activityType, duration, customField, caloriesBurned } = req.body;
    try {
        const goals = await Goal.find({ userId: req.user.id })
        for (let goal of goals) {
            if (goal.status == 'completed' || goal.status == 'paused') {
                continue
            }
            switch (goal.fitnessGoal) {
                case 'burn_calories':
                    goal.currentValue += caloriesBurned
                    if (goal.currentValue >= goal.targetValue) {
                        goal.status = 'completed'
                        goal.currentValue = goal.targetValue
                    }
                    break;
                case 'distance':
                    if (activityType == 'running' || activityType == 'hiking' || activityType == 'walking' || activityType == 'cycling') {
                        goal.currentValue += customField
                        if (goal.currentValue >= goal.targetValue) {
                            goal.status = 'completed'
                            goal.currentValue = goal.targetValue
                        }
                        break;
                    }
                case 'duration':
                    goal.currentValue += duration
                    if (goal.currentValue >= goal.targetValue) {
                        goal.status = 'completed'
                        goal.currentValue = goal.targetValue
                    }
                    break;
                case 'frequency':
                    if (activityType == 'workout') {
                        goal.currentValue++
                    }
                    if (goal.currentValue >= goal.targetValue) {
                        goal.status = 'completed'
                        goal.currentValue = goal.targetValue
                    }
                    break;
                case 'strength':
                    if (activityType == 'weightlifting') {
                        goal.currentValue = Math.max(customField, goal.currentValue)
                        if (goal.currentValue >= goal.targetValue) {
                            goal.status = 'completed'
                            goal.currentValue = goal.targetValue
                        }
                    }
                    break;
                default:
                    break;
            }
            await goal.save();
        }
        res.status(200).json({ msg: 'Goals Updated.' });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
})

app.delete('/:id', authUser, async (req, res) => {
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    try {
        const goal = await Goal.findByIdAndDelete(req.params.id)
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.status(200).json({ msg: 'Goal Deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', authUser, async (req, res) => {
    // console.log(req.user);
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    try {
        const goals = await Goal.find({ userId: req.user.id })
        res.status(200).json({ goals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = app;
