const express = require("express");
const app = express();
const PORT = 3000; // Set the port for the server
const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://localhost:27017/school_system";
const cors = require("cors");
const bodyParser = require("body-parser");
//const loginRouter = require("./routes/login");

// Import controllers
const userController = require("./controllers/userController");
const projectController = require("./controllers/projectController");

// Use CORS middleware
app.use(
  cors({
    origin: "http://localhost:8080", // Allow requests from this origin
    credentials: true, // Allow sending cookies
  })
);

// Parse JSON request body
app.use(bodyParser.json());

// Mount the login router
//app.use("/", loginRouter);

// Middleware to parse JSON bodies
app.use(express.json());

//Connect to DB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Route for user login
app.post("/login", userController.login);

// Route for user registration
app.post("/register", userController.register);
app.put("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

// Route for user logout
app.post("/logout", userController.logout);

// Route for projects
app.get("/projects", projectController.projects);
app.put("/projects/:id", projectController.updateProject);
app.delete("/projects/:id", projectController.deleteProject);
app.post("/projects", projectController.createProject);

// Route for users
app.get("/users", userController.getAllUsers);
// Route for fetching only students
app.get("/students", userController.getStudents);
app.get("/teachers", userController.getTeachers);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
