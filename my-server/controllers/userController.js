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
    const isValid = await isValidUser(correo, contraseña);

    if (isValid) {
      const role = await getRole(correo); // Implement your own function to determine the user's role

      // If credentials are valid, generate JWT token
      const token = jwt.sign({ correo, rol: role }, "your-secret-key", {
        expiresIn: "1h",
      });

      // Send JWT token back to the client
      res.status(200).json({
        success: "Valid credentials",
        correo: correo,
        rol: role,
        token,
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
      project,
      alumnos,
    } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ correo });

    if (existingUser) {
      return res.status(400).json({ error: "email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(contraseña, 10); // 10 is the salt rounds

    // Create a new user with hashed password
    const newUser = new User({
      correo,
      contraseña: hashedPassword,
      rol,
      nombre,
      apellido,
      username,
      _id,
      project,
      alumnos,
    });
    await newUser.save();
    res.status(201).json({ message: "user created successfully" });
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
      rol: student.rol,
      nombre: student.nombre,
      apellido: student.apellido,
      project: student.project,
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
      rol: teacher.rol,
      nombre: teacher.nombre,
      apellido: teacher.apellido,
      alumnos: teacher.alumnos,
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
