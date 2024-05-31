const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    nombre: {
      type: String,
      required: true,
    },
    empresa: {
      type: String,
      required: true,
    },
    asesorExterno: {
      nombre: String,
      correo: String,
      telefono: Number,
    },
  },
  { versionKey: false } // Disable versioning
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
