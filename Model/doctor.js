const mongoose = require("mongoose");
const doctorSchema = mongoose.Schema(
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
    },
    specialization: {
      type: String,
    },
    bio: {
      type: String,
    },
    DOB: {
      type: String,
    },
    gender: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    inputKey: {
      type: String,
    },
    avatar: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    isDoctor: {
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

module.exports = mongoose.model("doctors", doctorSchema);
