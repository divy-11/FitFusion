const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: { //Cardio, Strength, Yoga, HIIT, Cycling, Running
        type: String,
        required: true
    },
    duration: { type: Number }, //MINUTES
    caloriesBurned: { type: Number },
    notes: { type: String },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', ActivitySchema)
module.exports = Activity;
