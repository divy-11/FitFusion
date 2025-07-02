const express = require('express');
const app = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const z = require('zod');
const authUser = require('../middleware/middleware');

const validGoals = [
    'Muscle Gain (Hypertrophy)',
    'Fat Loss / Weight Loss',
    'Strength Building',
    'Endurance Improvement',
    'Flexibility & Mobility',
    'Athletic Performance',
    'General Health & Longevity',
    'Mental Wellness & Stress Relief'
];

const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
});

// profile: z.object({
//     age: z.number().min(0),
//     weight: z.number(),
//     height: z.number(),
//     fitnessGoals: z.array(z.enum(validGoals)),
//     targetWeight: z.number(),
// })


app.post('/', async (req, res) => {
    const safeData = registerSchema.safeParse(req.body);
    if (!safeData.success) {
        const errMsg = safeData.error.flatten().fieldErrors
        return res.status(400).json({ errors: errMsg.email || errMsg.password || errMsg.name });
    }
    const { name, email, password } = safeData.data;

    try {
        const userCheck = await User.findOne({ email });
        if (userCheck) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ msg: 'User registered', userId: user._id, token: `Bearer ${token}` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const {
            age,
            weight,
            height,
            fitnessGoals,
            activityLevel,
            primaryGoal,
            onboardingCompleted
        } = req.body
        // console.log(onboardingCompleted)
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ msg: "User not found" })

        user.profile.age = age
        user.profile.weight = weight
        user.profile.height = height
        user.profile.fitnessGoals = fitnessGoals
        user.profile.activityLevel = activityLevel
        user.profile.primaryGoal = primaryGoal
        user.profile.onboardingCompleted = onboardingCompleted
        await user.save()

        const updatedUser = await User.findById(id).select('-password')
        res.status(200).json(updatedUser)
    } catch (err) {
        console.error("Update error:", err)
        res.status(500).json({ error: "Server error" })
    }
});

app.get('/', authUser, async (req, res) => {
    if (!req.user.id) {
        return res.status(401).json({ message: "Please login first." });
    }
    try {
        // const user = await User.findById(req.params.id);
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

app.post('/login', async (req, res) => {
    const safeData = loginSchema.safeParse(req.body)
    if (!safeData.success) {
        return res.status(400).json({ errors: safeData.error.flatten().fieldErrors });
    }
    const { email, password } = safeData.data

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const checkPass = await bcrypt.compare(password, user.password);
        // console.log(checkPass);
        if (!checkPass) return res.status(400).json({ msg: 'Incorrect password' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token: `Bearer ${token}`, userId: user._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/', authUser, async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ message: "Please login first." });
        }
        const allowedFields = ["age", "height", "weight", "fitnessGoals","onboardingCompleted"];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }
        // console.log(req.user.id);

        // console.log(updates);

        const updatedUser = await User.findByIdAndUpdate(req.user.id, { profile: updates }, { new: true })
        // console.log(updatedUser);

        res.status(200).json({ msg: "User Updated!!" })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
