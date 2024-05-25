// userController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Function to handle user login
exports.login = async (req, res) => {
  try {
    // Validate user credentials
    const { correo, contraseña } = req.body;
    const { isValid, nombre, role, id } = await validateUserAndRole(
      correo,
      contraseña
    );

    if (isValid) {
      // If credentials are valid, generate JWT token
      const token = jwt.sign({ correo, rol: role }, "your-secret-key", {
        expiresIn: "1h",
      });

      // Send JWT token and user info back to the client
      res.status(200).json({
        success: "Valid credentials",
        correo: correo,
        nombre: nombre,
        rol: role,
        token,
        id,
      });
    } else {
      // If credentials are invalid, send error response
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    // Handle errors
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by their ID, excluding the 'contraseña' property
    const user = await User.findById(userId).select("-contraseña");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user is found, send it in the response
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to handle user registration
exports.register = async (req, res) => {
  try {
    const {
      correo,
      contraseña,
      rol,
      nombre,
      apellido,
      username,
      _id,
      proyecto,
      carrera,
      numeroTelefonico,
      apellidoM,
      empresa,
      asesorExterno,
      periodo,
      fechaAprobacion,
    } = req.body;

    // Check if the user already exists
    // Check if the user already exists by email
    const existingUserByEmail = await User.findOne({ correo });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Correo ya existe" });
    }

    // Check if the user already exists by ID
    const existingUserById = await User.findOne({ _id });

    if (existingUserById) {
      return res.status(400).json({ error: "ID ya existe" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(contraseña, 10); // 10 is the salt rounds

    // Create a new user with the updated object
    const newUserObject = {
      correo,
      contraseña: hashedPassword,
      rol,
      nombre,
      apellido,
      username,
      _id,
      proyecto,
      carrera,
      numeroTelefonico,
      apellidoM,
      empresa,
      asesorExterno,
      periodo,
      fechaAprobacion,
    };

    // Conditionally include alumnos field if the role is teacher and it's present in the request body
    if (rol === "teacher" && req.body.alumnos) {
      newUserObject.alumnos = req.body.alumnos;
    }

    const newUser = new User(newUserObject);

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const newData = req.body;

    // Find the user by ID and update it with the new data
    const updatedUser = await User.findByIdAndUpdate(userId, newData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to handle user logout
exports.logout = (req, res) => {
  // Destroy user session or JWT token
  // For example, if using JWT, you can simply invalidate the token on the client side

  res.status(200).json({ message: "User logged out successfully" });
};

// Function to fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the User collection
    const users = await User.find({}, { contraseña: 0, __v: 0 }); // Exclude contraeña and __v fields

    res.status(200).json(users);
  } catch (error) {
    // Handle errors
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to fetch only students
exports.getStudents = async (req, res) => {
  try {
    // Fetch only students from the User collection
    const students = await User.find({ rol: "student" });

    // Extract the actual user data and filter out unnecessary properties
    const filteredStudents = students.map((student) => ({
      _id: student._id,
      correo: student.correo,
      nombre: student.nombre,
      apellido: student.apellido,
      apellidoM: student.apellidoM,
      proyecto: student.proyecto,
      calificaciones: student.calificaciones,
      asesorias: student.asesorias,
      carrera: student.carrera,
      numeroTelefonico: student.numeroTelefonico,
      asesorExterno: student.asesorExterno,
      empresa: student.empresa,
      periodo: student.periodo,
      seguimiento1: student.seguimiento1 ?? null,
      seguimiento2: student.seguimiento2 ?? null,
      seguimiento3: student.seguimiento3 ?? null,
      archivosAsesorias: student.archivosAsesorias ?? [],
      archivos: student.archivos ?? {},
    }));

    res.status(200).json(filteredStudents);
  } catch (error) {
    // Handle errors
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to fetch only teachers
exports.getTeachers = async (req, res) => {
  try {
    // Fetch only teachers from the User collection
    const teachers = await User.find({ rol: "teacher" });

    // Extract the actual user data and filter out unnecessary properties
    const filteredTeachers = teachers.map((teacher) => ({
      _id: teacher._id,
      correo: teacher.correo,
      nombre: teacher.nombre,
      apellido: teacher.apellido,
      apellidoM: teacher.apellidoM,
      alumnos: teacher.alumnos,
      numeroTelefonico: teacher.numeroTelefonico,
    }));

    res.status(200).json(filteredTeachers);
  } catch (error) {
    // Handle errors
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function isValidUser(correo, contraseña) {
  try {
    // Query the database to find a user with the provided email
    const user = await User.findOne({ correo });
    // If no user is found with the provided email, return false
    if (!user) {
      return false;
    }

    // Check if the provided password matches the user's password
    const isPasswordValid = await user.comparePassword(contraseña);

    // Return true if the password is valid, false otherwise
    return isPasswordValid;
  } catch (error) {
    console.error("Error validating user:", error);
    return false; // Return false in case of any error
  }
}

async function getRole(correo) {
  try {
    // Query the database to find a user with the provided email
    const user = await User.findOne({ correo });

    // If no user is found with the provided email, return null or an appropriate default role
    if (!user) {
      return null; // or return 'default' or any other appropriate default role
    }

    // Return the user's role from the database
    return user.rol;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null; // Return null in case of any error
  }
}

function generateToken(username, role) {
  // Generate JWT token with user information (username, role, etc.)
  // You can customize the token payload as needed
  // For example, you can include the user's role in the token payload
  const payload = {
    correo,
    rol,
  };
  const secretKey = "your_secret_key"; // Replace with your actual secret key for JWT
  const options = {
    expiresIn: "1h", // Token expiration time
  };
  return jwt.sign(payload, secretKey, options);
}

// Function to validate user credentials and retrieve user's name and role
async function validateUserAndRole(correo, contraseña) {
  // Validate user credentials
  const isValid = await isValidUser(correo, contraseña);

  if (!isValid) {
    return { isValid: false };
  }

  // Get user's role and name
  const role = await getRole(correo);
  const nombre = await getUserName(correo);
  const id = await getUserId(correo);

  return { isValid: true, role, nombre, id };
}

// Function to retrieve user's name based on email
async function getUserName(correo) {
  try {
    // Find the user in the database based on their email
    const user = await User.findOne({ correo });

    // If user is found, return their name
    if (user) {
      return user.nombre; // Assuming 'nombre' is the field containing the user's name
    } else {
      return null; // If user is not found, return null
    }
  } catch (error) {
    console.error("Error fetching user's name:", error);
    throw error;
  }
}

// Function to retrieve user's _id based on email
async function getUserId(correo) {
  try {
    // Find the user in the database based on their email
    const user = await User.findOne({ correo });

    // If user is found, return their _id
    if (user) {
      return user._id; // Return the _id property of the user object
    } else {
      return null; // If user is not found, return null
    }
  } catch (error) {
    console.error("Error fetching user's _id:", error);
    throw error;
  }
}
