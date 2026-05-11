const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  specialization: {
    type: String,
    required: true,
  },

  experience: {
    type: String,
    required: true,
  },

  credential: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Technician", technicianSchema);