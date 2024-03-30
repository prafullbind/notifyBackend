const User = require('../models/user'); // Assuming your User model is in a file named User.js
const Task  = require("../models/task");

// POST route to create a new user
const addUser = async (req, res) => {
    try {
        const { lastName,firstName, email, password } = req.body;
        const user = new User({ firstName, lastName, email, password});
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET route to retrieve all users
const getUser = async(req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST route for user login
const login =  async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
            return res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET route to fetch tasks created by a particular user
 const getUserTask =  async (req, res) => {
    const userId = req.params.userId;

    try {
        const tasks = await Task.find({ createdBy: userId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { addUser, getUser, getUserTask, login};
