const mongoose = require("mongoose");
const femaleSchema = mongoose.Schema({
  userId: {
    type: String,
  },
});

module.exports = mongoose.model("females", femaleSchema);
