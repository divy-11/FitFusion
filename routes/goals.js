const express = require('express');
const app = express.Router();
const z = require('zod');
const Goal = require('../models/Goal');

const goalSchema = z.object({
    userId: z.string(),
    type: z.string(),
    target: z.number(),
    deadline: z.string().datetime().optional() 
});


app.post('/', async (req, res) => {
    const result = goalSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const goal = new Goal(result.data);
        await goal.save();
        res.status(201).json({ msg: 'Goal set successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/:userId', async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.params.userId }).sort({ deadline: 1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
