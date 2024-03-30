const mongoose = require("mongoose");


// Define the user schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    // gender: {
    //     type: String,
    //     enum: ['male', 'female', 'other'],
    //     required: true
    // },
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     trim: true
    // },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{ timestamps: true });

module.exports = mongoose.model("User", userSchema);
