const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fitnessGoal: { type: String },
    targetWeight: { type: Number },
    targetDate: { type: Date }
}, { timestamps: true });

const Goal = mongoose.model('Goal', GoalSchema);

module.exports = Goal;
