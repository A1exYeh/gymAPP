//mongodb
const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: String,
    lastWeight: Number,
    lastUpdated: Date
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    exercises: [ExerciseSchema],
    lastGymVisit: Date
});



//we are looking for the user profile 
module.exports = mongoose.model('User', UserSchema, 'icarus-app-db');