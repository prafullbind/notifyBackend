const express = require("express");
const router = express.Router();
const {addUser, getUser, getUserTask, login} = require("../controllers/user");

router.post("/addUser", addUser);
router.get("/getUser", getUser);
router.get("/getUserTask/:userId", getUserTask);
router.post("/login", login);

module.exports = router;

