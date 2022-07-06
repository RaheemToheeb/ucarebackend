const mongoose = require("mongoose");
const hospitalSchema = mongoose.Schema(
  {
    logo: {
      type: String,
    },
    logoId: {
      type: String,
    },
    UHID: {
      type: String,
      unique: true,
    },
    hospitalName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    telephone: {
      type: Number,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    specializations: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    key: {
      type: String,
    },
    verifiedToken: {
      type: String,
    },
    isVerify: {
      type: Boolean,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    OTP: {
      type: String,
    },
    inputOTP: {
      type: String,
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctors",
      },
    ],
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patients",
      },
    ],
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointments",
      },
    ],
    males: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "males",
      },
    ],
    females: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "females",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("hospitals", hospitalSchema);
