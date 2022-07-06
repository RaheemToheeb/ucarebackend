const mongoose = require("mongoose");
const userModel = mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
    },
    telephone: {
      type: Number,
      unique: true,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    avatar: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    isPatient: {
      type: Boolean,
      default: true,
    },
    isVerify: {
      type: Boolean,
    },
    verifiedToken: {
      type: String,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospitals",
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointments",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("patients", userModel);
