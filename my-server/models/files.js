const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
});

module.exports = mongoose.model("FileModel", FileSchema);
