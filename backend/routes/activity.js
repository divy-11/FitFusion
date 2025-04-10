const express = require('express');
const app = express.Router();
const z = require('zod');
const Activity = require('../models/Activity');
const authUser = require("../middleware/middleware")

const activitySchema = z.object({
    userId: z.string(),
    activityType: z.string(),
    duration: z.number().positive(),
    caloriesBurned: z.number().optional(),
    timestamp: z.string().datetime()
});


app.post('/', authUser, async (req, res) => {
    // console.log(req.user)
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    // console.log({ userId: req.user.id, ...req.body })
    const inputCheck = activitySchema.safeParse({ userId: req.user.id, ...req.body });
    if (!inputCheck.success) {
        return res.status(400).json({ errors: inputCheck.error.flatten().fieldErrors });
    }

    try {
        const activity = await Activity.create(inputCheck.data)
        res.status(201).json({ msg: 'Activity logged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/:userId', authUser, async (req, res) => { //as we are retrieving user history i am assuming this can be done by user only.
    try {
        const activities = await Activity.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
