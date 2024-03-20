const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    notificationTime: Date,
    completed: {
        type: Boolean,
        default: false
    },
    fcm: String
}, {timestamps:true});

module.exports = new mongoose.model("task", taskSchema);