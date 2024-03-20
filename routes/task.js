const express = require("express");
const router = express.Router();
const {getTasks, addTask, editTask, getTaskDetail} = require("../controllers/task");

router.get("/getTask", getTasks);
router.post("/addTask", addTask);
router.get("/getTaskDetail/:id", getTaskDetail);
router.put("/editTask/:id", editTask);

module.exports = router;

