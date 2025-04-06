const express = require('express');
const app = express.Router();
const z = require('zod');
const Activity = require('../models/Activity');

const activitySchema = z.object({
    userId: z.string(),
    type: z.string(),
    duration: z.number().positive(),
    caloriesBurned: z.number().optional(),
    date: z.string().datetime().optional() 
});


app.post('/', async (req, res) => {
    const result = activitySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const activity = new Activity(result.data);
        await activity.save();
        res.status(201).json({ msg: 'Activity logged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/:userId', async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
