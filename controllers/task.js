const task = require("../models/task");
const users = require("../models/user");
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const admin =require("firebase-admin");

const serviceAccount = require('../notifytask-ff85e-firebase-adminsdk-zf2u7-e45f8f88c0.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Use your email service provider here
    port: 465,
    secure: true,
    auth: {
        user: 'deepika.rawal@nprservices.in', // Your email address
        pass: 'Dell@123456!' // Your email password
    }
});



// // Function to continuously monitor tasks and send notifications
// const monitorTasks = () => {
//     schedule.scheduleJob('*/1 * * * * ', async () => { // Run every minute
//         const currentTime = new Date();
//         const tasks = await task.find({ notificationTime: { $gte: currentTime, $lte: new Date(currentTime.getTime() + 5 * 60000)}});
//         for (const task of tasks) {
//             try {
//                 await scheduleNotification(task.fcm, task.title, task.description, task.notificationTime);
//                 console.log('Notification sent for task:', task._id);
//             } catch (error) {
//                 console.error('Error sending notification for task:', task._id, error);
//             }
//         }
//     });
// };

// // Call monitorTasks function to start monitoring tasks
// monitorTasks();



// // Function to continuously monitor tasks and send notifications
// const monitorTasks = () => {
//     schedule.scheduleJob('*/1 * * * * ', async () => { // Run every minute
//         const currentTime = new Date();
//         const tasks = await task.find({ notificationTime: { $gte: currentTime, $lte: new Date(currentTime.getTime() + 5 * 60000)}});
//         for (const task of tasks) {
//             try {
//                 const lastNotificationTime = lastNotificationTimes[task._id] || new Date(0); // Initialize lastNotificationTime to epoch if not set
//                 const timeDiff = currentTime - lastNotificationTime;
                
//                 // Check if at least 1 minute has passed since the last notification
//                 if (timeDiff >= 60000) {
//                     await scheduleNotification(task.fcm, task.title, task.description, task.notificationTime);
//                     console.log('Notification sent for task:', task._id);
//                     // Update last notification time
//                     lastNotificationTimes[task._id] = currentTime;
//                 } else {
//                     console.log('Notification skipped for task:', task._id, 'within one minute interval');
//                 }
//             } catch (error) {
//                 console.error('Error sending notification for task:', task._id, error);
//             }
//         }
//     });
// };

// // Call monitorTasks function to start monitoring tasks
// monitorTasks();

// Define an object to store last notification times for each task
// const lastNotificationTimes = {};

// let isMonitoring = false; // Flag to prevent concurrent monitoring

// // Function to continuously monitor tasks and send notifications
// const monitorTasks = () => {

//     if (isMonitoring) {
//         console.log('Monitoring is already in progress. Skipping...');
//         return;
//     }
    
//     isMonitoring = true;

//     schedule.scheduleJob('*/1 * * * * ', async () => { // Run every minute
//         const currentTime = new Date();
//         const tasks = await task.find({ notificationTime: { $gte: currentTime, $lte: new Date(currentTime.getTime() + 5 * 60000)}});
//         for (const task of tasks) {
//             try {
//                 const lastNotificationTime = lastNotificationTimes[task._id] || new Date(0); // Initialize lastNotificationTime to epoch if not set
//                 const timeDiff = currentTime - lastNotificationTime;
                
//                 // Check if at least 1 minute has passed since the last notification
//                 if (timeDiff >= 60000) {
//                     await scheduleNotification(task.fcm, task.title, task.description, task.notificationTime);
//                     console.log('Notification sent for task:', task._id);
//                     // Remove the last notification time entry for this task
//                     delete lastNotificationTimes[task._id];
//                 } else {
//                     console.log('Notification skipped for task:', task._id, 'within one minute interval');
//                 }
//             } catch (error) {
//                 console.error('Error sending notification for task:', task._id, error);
//             }
//         }
//         isMonitoring = false; // Reset the flag after completing monitoring
//     });
// };

// // Call monitorTasks function to start monitoring tasks
// monitorTasks();


const lastNotificationTimes = {};
let isMonitoring = false;

const monitorTasks = () => {
    if (isMonitoring) {
        console.log('Monitoring is already in progress. Skipping...');
        return;
    }
    
    isMonitoring = true;

    schedule.scheduleJob('*/1 * * * *', async () => {
        try {
            const currentTime = new Date();
            const tasks = await task.find({ notificationTime: { $gte: currentTime, $lte: new Date(currentTime.getTime() + 5 * 60000) }});
            for (const task of tasks) {
                try {
                    const lastNotificationTime = lastNotificationTimes[task._id] || new Date(0);
                    const timeDiff = currentTime - lastNotificationTime;
                    
                    if (timeDiff >= 60000) {
                        await scheduleNotification(task.fcm, task.title, task.description, task.notificationTime);
                        console.log('Notification sent for task:', task._id);
                        delete lastNotificationTimes[task._id];
                    } else {
                        console.log('Notification skipped for task:', task._id, 'within one minute interval');
                    }
                } catch (error) {
                    console.error('Error sending notification for task:', task._id, error);
                }
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            isMonitoring = false;
        }
    });
};

monitorTasks();




const scheduleNotification = async (token, title, description, notificationTime) => {
    // Convert notificationTime to IST if needed
    const ISTNotificationTime = convertToIST(notificationTime);

    const currentTime = new Date();
    const fiveMinutesBefore = new Date(ISTNotificationTime.getTime() - 5 * 60000); // 5 minutes before

    // Schedule notification only if notification time is in the future
    if ( fiveMinutesBefore.getTime() >= currentTime.getTime()) {
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
        console.log("Messaage", message);
        try {
            await admin.messaging().send(message);
            console.log('Notification sent successfully');
            console.log("message", message);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
};

// Function to convert datetime to Indian Standard Time (IST)
const convertToIST = (dateTime) => {
    const ISTOffset = 330 * 60 * 1000; // Offset for Indian Standard Time (IST) in milliseconds
    const localTime = new Date(dateTime); // Parse datetime string into Date object
    const ISTTime = new Date(localTime.getTime() + ISTOffset); // Adjust datetime by adding IST offset
    return ISTTime;
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
            
            // Calculate the time difference between the notification time and the current time
            const timeDiff = notificationTime - new Date();
            
            // Check if the notification time is within the specified time range (within 5 minutes from now)
            if (timeDiff <= 5 * 60000) {
                // Send immediate notification
                scheduleNotification(req.body.fcm, req.body.title, req.body.description, notificationTime);
            }
        
            let user = await users.find({_id:req.body.createdBy});
            // Define email options
            let emailId = user[0].email;
            const mailOptions = {
                from: 'deepika.rawal@nprservices.in', // Sender's email address
                to: emailId, // Receiver's email address
                subject: 'Test created', // Subject line
                text: `Your task created successfully with title ${req.body.title}` // Plain text body
            };
        
            // Send email
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        
            res.status(200).json("Task created successfuly");
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