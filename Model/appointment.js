const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema(
  {
    patientName: {
      type: String,
    },
    patientCase: {
      type: String,
    },
    symptoms: {
      type: String,
    },
    allergies: {
      type: String,
    },
    specialist: {
      type: String,
    },
    department: {
      type: String,
    },
    brief: {
      type: String,
    },
    dateAndTime: {
      type: Date,
    },
    time: {
      type: String,
    },
    doctorName: {
      type: String,
    },
    doctorRole: {
      type: String,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospitals",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("appointments", appointmentSchema);
