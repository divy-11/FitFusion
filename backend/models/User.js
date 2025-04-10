const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
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
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        fitnessGoals: {
            type: [String],
            default: []
        },
        targetWeight: {
            type: Number,
            required: true
        },
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema)

module.exports = User;
