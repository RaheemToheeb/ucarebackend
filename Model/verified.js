const mongoose = require("mongoose");
const verifiedModel = mongoose.Schema(
  {
    token: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("verifieds", verifiedModel);
