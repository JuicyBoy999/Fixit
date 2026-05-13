const { addUser, updateProfile } = require("../controller/userController");
const express = require("express");
const router = express.Router();

router.post("/create", addUser);
router.put("/profile/:id", updateProfile);

module.exports = router;
