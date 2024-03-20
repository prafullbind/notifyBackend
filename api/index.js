const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoClient = require("../config/config")();

const app = express();
const PORT = process.env.PORT || 2410;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// const admin = require('firebase-admin');

// const serviceAccount = require('./notifytask-ff85e-firebase-adminsdk-zf2u7-e45f8f88c0.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });



app.use("/notify", require("../routes/task"))
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
