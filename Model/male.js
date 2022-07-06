const mongoose = require("mongoose");
const maleSchema = mongoose.Schema({
  userId: {
    type: String,
  },
});

module.exports = mongoose.model("males", maleSchema);
