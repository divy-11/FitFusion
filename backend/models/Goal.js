const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String },
    description: { type: String },
    fitnessGoal: { type: String },
    targetValue: { type: Number },
    currentValue: { type: Number },
    unit: { type: String },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused'],
        default: 'active',
    },
    targetDate: { type: Date }
}, { timestamps: true });

const Goal = mongoose.model('Goal', GoalSchema);

module.exports = Goal;
