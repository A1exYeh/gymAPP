//mongodb
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    userInput: String
});

//we are looking for the user profile 
module.exports = mongoose.model('User', UserSchema, 'icarus-app-db');