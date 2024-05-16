const express = require("express");
// Route to fetch PDF files
const { Readable } = require("stream");
const app = express();
const PORT = 3000; // Set the port for the server
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

// Import controllers
const userController = require("./controllers/userController");
const projectController = require("./controllers/projectController");

const MONGODB_URI = "mongodb://localhost:27017/school_system";

// Use CORS middleware
app.use(
  cors({
    origin: "http://localhost:8080", // Allow requests from this origin
    credentials: true, // Allow sending cookies
  })
);

// Parse JSON request body
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Middleware to parse JSON bodies
app.use(express.json());

// Establish MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then((db) => {
    console.log("Connected to MongoDB");
    // Make the `db` object available globally or within a closure
    app.locals.db = db;
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Parse JSON request body
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(express.json());

const conn = mongoose.createConnection(MONGODB_URI);

let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Route for user login
app.post("/login", userController.login);

// Route for user registration
app.post("/register", userController.register);

// Route for fetching a user by ID
app.get("/users/:id", userController.getUserById);
app.put("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

// Route for user logout
app.post("/logout", userController.logout);

// Route for projects
app.get("/projects", projectController.projects);
app.get("/projects/:id", projectController.getProjectById);
app.put("/projects/:id", projectController.updateProject);
app.delete("/projects/:id", projectController.deleteProject);
app.post("/projects", projectController.createProject);

// Route for users
app.get("/users", userController.getAllUsers);

// Route for fetching only students
app.get("/students", userController.getStudents);
app.get("/teachers", userController.getTeachers);

// Route for uploading PDF files
app.post("/upload", upload.single("file"), (req, res) => {
  res.status(201).send({ file: req.file });
});

// Define a route to fetch PDF files
// Define a route to fetch PDF files
app.get("/files", async (req, res) => {
  try {
    const db = mongoose.connection; // Access the MongoDB connection object
    const gfs = Grid(db.db, mongoose.mongo); // Initialize gfs

    gfs.collection("uploads"); // Specify the collection

    const files = await gfs.files.find({}).toArray(); // Fetch files from GridFS

    // Fetch file data for each document
    const filesWithData = await Promise.all(
      files.map(async (file) => {
        try {
          const fileChunks = await gfs.db
            .collection("uploads.chunks")
            .find({ files_id: file._id })
            .toArray();
          const fileData = fileChunks.reduce((data, chunk) => {
            data.push(chunk.data.buffer); // Assuming data is stored as a Buffer
            return data;
          }, []);
          return {
            filename: file.filename,
            data: Buffer.concat(fileData).toString("base64"),
          };
        } catch (error) {
          console.error("Error during file download:", error);
          return null; // Handle the error by returning null or another appropriate value
        }
      })
    );

    // Filter out null values (failed downloads) and send the remaining files
    const validFiles = filesWithData.filter((file) => file !== null);
    res.json(validFiles);
  } catch (error) {
    console.error("Error fetching files from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
