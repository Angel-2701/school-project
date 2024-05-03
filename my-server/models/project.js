const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
  },
  { versionKey: false } // Disable versioning
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
