const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  correo: { type: String, unique: true },
  _id: Number,
  alumnos: [Number],
  contraseña: String,
  rol: { type: String, default: "student" }, // Default role is 'student'
  nombre: String,
  apellido: String,
  maestro: String,
  asesorExterno: String,
  carrera: String,
  periodo: String,
  project: Number, // Optional field for projects as an array of numbers
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Use bcrypt to compare the provided password with the hashed password stored in the database
    return await bcrypt.compare(candidatePassword, this.contraseña);
    //return candidatePassword === this.contraseña;
  } catch (error) {
    // Return false in case of any error
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);
