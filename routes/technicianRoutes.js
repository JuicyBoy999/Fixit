const express = require("express");
const router = express.Router();

const multer = require("multer");

const Technician = require("../models/Technician");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/register",
  upload.single("credential"),
  async (req, res) => {
    try {
      const technician = new Technician({
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        specialization: req.body.specialization,
        experience: req.body.experience,
        credential: req.file.path,
      });

      await technician.save();

      res.status(201).json({
        message: "Technician Registered Successfully",
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Registration Failed",
      });
    }
  }
);

module.exports = router;