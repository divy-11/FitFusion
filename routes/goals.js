const express = require('express');
const app = express.Router();
const z = require('zod');
const Goal = require('../models/Goal');
const authUser = require('../middleware/middleware');

const goalSchema = z.object({
    userId: z.string(),
    fitnessGoal: z.string(),
    targetWeight: z.number(),
    targetDate: z.string().datetime().optional()
});


app.post('/', authUser, async (req, res) => {
    // console.log(req.user);
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    const result = goalSchema.safeParse({ userId: req.user.id, ...req.body });
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }

    try {
        const goal = await Goal.create(result.data)
        res.status(201).json({ msg: 'Goal set successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = app;
