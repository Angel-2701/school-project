const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  correo: { type: String, unique: true },
  _id: Number,
  contraseña: String,
  rol: { type: String, default: "student" }, // Default role is 'student'
  nombre: String,
  apellido: String,
  apellidoM: String,
  empresa: String,
  carrera: String, // Add the carrera field
  maestro: String,
  asesorExterno: {
    nombre: String,
    correo: String,
    telefono: Number,
  },
  periodo: String,
  proyecto: Number, // Optional field for projects as an array of numbers
  calificaciones: {
    calificacion1: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    calificacion2: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    calificacion3: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
  },
  promedio: {
    type: Number,
    default: 0,
  },
  asesorias: Number,
  numeroTelefonico: Number,
  fechaAprobacion: String,
});

// Conditionally include alumnos field only when rol is "teacher"
userSchema.add({
  alumnos: {
    type: [Number], // Assuming alumnos are identified by numbers
    default: undefined,
    required: function () {
      return this.rol === "teacher";
    },
  },
});

// Add dynamic properties for storing file IDs
userSchema.add({
  seguimiento1: String,
  seguimiento2: String,
  seguimiento3: String,
  archivos: {
    type: Map,
    of: String,
  },
});

userSchema.add({
  archivosAsesorias: [
    {
      type: String,
      ref: "Asesoria",
    },
  ],
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Use bcrypt to compare the provided password with the hashed password stored in the database
    return await bcrypt.compare(candidatePassword, this.contraseña);
  } catch (error) {
    // Return false in case of any error
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
