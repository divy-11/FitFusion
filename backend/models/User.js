const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        age: {
            type: Number
        },
        weight: {
            type: Number
        },
        height: {
            type: Number
        },
        fitnessGoals: {
            type: String
        },
        targetWeight: {
            type: Number
        },
        activityLevel: {
            type: String
        },
        onboardingCompleted: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema)

module.exports = User;
