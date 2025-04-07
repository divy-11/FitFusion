const express = require('express');
const app = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const z = require('zod');

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    profile: z.object({
        age: z.number().min(0).optional(),
        weight: z.number().optional(),
        height: z.number().optional(),
        fitnessGoals: z.string().optional()
    }).optional()
});


app.post('/', async (req, res) => {
    const safeData = registerSchema.safeParse(req.body);
    if (!safeData.success) {
        return res.status(400).json({ errors: safeData.error.flatten().fieldErrors });
    }
    const { email, password, profile } = safeData.data;

    try {
        const userCheck = await User.findOne({ email });
        if (userCheck) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashed, profile });
        res.status(201).json({ msg: 'User registered' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/:id', async (req, res) => {
    try {
        // const user = await User.findById(req.params.id);
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
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
        res.json({ token: `Bearer ${token}` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
