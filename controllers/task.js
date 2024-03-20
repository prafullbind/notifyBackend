const task = require("../models/task");
const schedule = require('node-schedule');

const admin =require("firebase-admin");

const serviceAccount = require('../notifytask-ff85e-firebase-adminsdk-zf2u7-e45f8f88c0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// Function to continuously monitor tasks and send notifications
const monitorTasks = () => {
    schedule.scheduleJob('*/1 * * * *', async () => { // Run every minute
        const currentTime = new Date();
        const tasks = await task.find({ notificationTime: { $gte: currentTime, $lte: new Date(currentTime.getTime() + 5 * 60000) } });
        for (const task of tasks) {
            try {
                await scheduleNotification(task.fcm, task.title, task.description, task.notificationTime);
                console.log('Notification sent for task:', task._id);
            } catch (error) {
                console.error('Error sending notification for task:', task._id, error);
            }
        }
    });
};

// Call monitorTasks function to start monitoring tasks
monitorTasks();

const scheduleNotification = async (token, title, description, notificationTime) => {
    const currentTime = new Date();
    const fiveMinutesBefore = new Date(notificationTime.getTime() - 5 * 60000); // 5 minutes before
    
    // Schedule notification only if notification time is in the future
    if (currentTime.getTime() >= fiveMinutesBefore.getTime()) {
        const message = {
            token: token,
            notification: {
                title: title,
                body: description
            },
            data: {
                // Optional data to send along with the notification
                message: "This is testing purpose"
            }
        };
        
        try {
            await admin.messaging().send(message);
            console.log('Notification sent successfully');
            console.log("message", message);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
};


const getTasks = async(req, res) => {
    try {
        const tasks = await task.find();
        res.status(200).send(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getTaskDetail = async(req, res) => {
    let {id} = req.params;
    try {
        const tasks = await task.find({_id: id});
        res.status(200).send(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const addTask = async(req, res) => {
    const newTask = new task(req.body);
        // Convert notificationTime string to Date object
        const notificationTime = new Date(req.body.notificationTime);
    try {
        await newTask.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const editTask = async(req, res) => {
    const { id } = req.params;
    try {
        const task = await task.findByIdAndUpdate(id, req.body, { new: true });
        const message = {
            token: task.fcm,
            notification: {
                title: task.title,
                body: task.description
            },
            data: {
                // Optional data to send along with the notification
                message: "This is testing purpose"
            }
        };

        try {
            await admin.messaging().send(message);
            console.log('Notification sent successfully');
            console.log("message", message);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
        res.json(task);
    } catch (err) {
        res.status(404).json({ error: 'Task not found' });
    }
}

module.exports = {getTasks, addTask, editTask, getTaskDetail};