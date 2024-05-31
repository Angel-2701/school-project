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
const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const twilio = require("twilio");

// Replace these values with your Twilio Account SID and Auth Token
const accountSid = "AC6f8cecb0eaf12d04eeb812a68f9b18fa";
const authToken = "157788d0b92831c7be31565cb81f4341";
// Initialize Twilio client with your credentials
const client2 = twilio(accountSid, authToken);

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

const asesoriaStorage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: "asesoria", // This will create the asesoria.files and asesoria.chunks collections
    };
  },
});

const archivoStorage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => {
    return {
      _id: file._id,
      filename: file.originalname,
      bucketName: "archivo", // This will create the asesoria.files and asesoria.chunks collections
    };
  },
});

const upload = multer({ storage });
const uploadAsesoria = multer({ storage: asesoriaStorage });
const uploadArchivo = multer({ storage: archivoStorage });

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
app.get("/users/email/:correo", userController.getUserByCorreo);
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

app.post("/upload-asesoria", uploadAsesoria.single("file"), (req, res) => {
  res.status(201).send({ file: req.file });
});

app.post("/upload-archivo", uploadArchivo.array("files", 10), (req, res) => {
  // 'files' should match the name attribute of the file input in the client-side form
  // '10' is the maximum number of files allowed in the request, adjust as needed

  // Access the uploaded files using req.files
  const uploadedFiles = req.files;

  // Process the uploaded files as needed
  // For demonstration purposes, let's just send back a response with the list of uploaded files
  res.status(201).send({ files: uploadedFiles });
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
            _id: file._id, // Add _id field to the response
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

// Fetch all asesoria files
app.get("/asesorias", async (req, res) => {
  try {
    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("asesoria");

    const files = await gfs.files.find({}).toArray();

    const filesWithData = await Promise.all(
      files.map(async (file) => {
        try {
          const fileChunks = await gfs.db
            .collection("asesoria.chunks")
            .find({ files_id: file._id })
            .toArray();
          const fileData = fileChunks.reduce((data, chunk) => {
            data.push(chunk.data.buffer);
            return data;
          }, []);
          return {
            _id: file._id,
            filename: file.filename,
            data: Buffer.concat(fileData).toString("base64"),
          };
        } catch (error) {
          console.error("Error during file download:", error);
          return null;
        }
      })
    );

    const validFiles = filesWithData.filter((file) => file !== null);
    res.json(validFiles);
  } catch (error) {
    console.error("Error fetching asesoria files from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const client = new MongoClient(MONGODB_URI);
client.connect().then(() => {
  const db = client.db("school_system");
  gfsBucketUploads = new GridFSBucket(db, { bucketName: "uploads" });
  gfsBucketArchivo = new GridFSBucket(db, { bucketName: "archivo" });
  gfsBucketAsesoria = new GridFSBucket(db, { bucketName: "asesoria" });
});

app.get("/files/:collection/:fileId", async (req, res) => {
  try {
    const { collection, fileId } = req.params;
    if (!ObjectId.isValid(fileId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fileId" });
    }

    const _id = new ObjectId(fileId);
    let gfsBucket;
    switch (collection) {
      case "uploads":
        gfsBucket = gfsBucketUploads;
        break;
      case "archivo":
        gfsBucket = gfsBucketArchivo;
        break;
      case "asesoria":
        gfsBucket = gfsBucketAsesoria;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid collection" });
    }

    const files = await gfsBucket.find({ _id }).toArray();
    if (!files.length) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const file = files[0];
    const readStream = gfsBucket.openDownloadStream(_id);
    const chunks = [];

    readStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    readStream.on("end", () => {
      const fileBuffer = Buffer.concat(chunks);
      res.json({
        filename: file.filename,
        data: fileBuffer.toString("base64"),
      });
    });

    readStream.on("error", (err) => {
      console.error("Error reading file from MongoDB:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
  } catch (error) {
    console.error("Error fetching file from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Fetch all archivo files
app.get("/archivos", async (req, res) => {
  try {
    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("archivo");

    const files = await gfs.files.find({}).toArray();

    const filesWithData = await Promise.all(
      files.map(async (file) => {
        try {
          const fileChunks = await gfs.db
            .collection("archivo.chunks")
            .find({ files_id: file._id })
            .toArray();
          const fileData = fileChunks.reduce((data, chunk) => {
            data.push(chunk.data.buffer);
            return data;
          }, []);
          return {
            _id: file._id,
            filename: file.filename,
            data: Buffer.concat(fileData).toString("base64"),
          };
        } catch (error) {
          console.error("Error during file download:", error);
          return null;
        }
      })
    );

    const validFiles = filesWithData.filter((file) => file !== null);
    res.json(validFiles);
  } catch (error) {
    console.error("Error fetching archivo files from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.delete("/files/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fileId" });
    }

    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("uploads");

    const file = await gfs.files.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    await gfs.files.deleteOne({ _id: new mongoose.Types.ObjectId(fileId) });
    await gfs.db
      .collection("asesoria.chunks")
      .deleteMany({ files_id: new mongoose.Types.ObjectId(fileId) });

    res
      .status(200)
      .json({ success: true, message: "file deleted successfully" });
  } catch (error) {
    console.error("Error deleting file from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.delete("/asesorias/:asesoriaId", async (req, res) => {
  try {
    const asesoriaId = req.params.asesoriaId;
    if (!mongoose.Types.ObjectId.isValid(asesoriaId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid asesoriaId" });
    }

    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("asesoria");

    const file = await gfs.files.findOne({
      _id: new mongoose.Types.ObjectId(asesoriaId),
    });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    await gfs.files.deleteOne({ _id: new mongoose.Types.ObjectId(asesoriaId) });
    await gfs.db
      .collection("asesoria.chunks")
      .deleteMany({ files_id: new mongoose.Types.ObjectId(asesoriaId) });

    res
      .status(200)
      .json({ success: true, message: "Asesoria file deleted successfully" });
  } catch (error) {
    console.error("Error deleting asesoria file from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route to delete an archivo file by file ID
app.delete("/archivos/:archivoId", async (req, res) => {
  try {
    const archivoId = req.params.archivoId;
    if (!mongoose.Types.ObjectId.isValid(archivoId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid archivoId" });
    }

    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("archivo");

    const file = await gfs.files.findOne({
      _id: new mongoose.Types.ObjectId(archivoId),
    });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    await gfs.files.deleteOne({ _id: new mongoose.Types.ObjectId(archivoId) });
    await gfs.db
      .collection("archivo.chunks")
      .deleteMany({ files_id: new mongoose.Types.ObjectId(archivoId) });

    res
      .status(200)
      .json({ success: true, message: "Archivo file deleted successfully" });
  } catch (error) {
    console.error("Error deleting archivo file from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route to fetch a PDF file by ID
app.get("/files/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Check if the provided file ID is valid
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fileId" });
    }

    const db = mongoose.connection;
    const gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("uploads");

    // Find the file with the given ID
    const file = await gfs.files.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    });
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Stream the file data back to the client
    const readStream = gfs.createReadStream({ _id: file._id });
    readStream.pipe(res);
  } catch (error) {
    console.error("Error fetching file from MongoDB:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Define a route to send an SMS message
// Define a route to send an SMS message
app.post("/send-sms", (req, res) => {
  // Generate a random code
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Replace 'recipient_phone_number' with the actual recipient's phone number
  client2.messages
    .create({
      body: `Your verification code is: ${randomCode}`, // Include the random code in the message body
      from: "+12232714251",
      to: req.body.phone, // Assuming the phone number is sent in the request body
    })
    .then((message) => {
      console.log("Message sent:", message.sid);
      res.json({ success: true, code: randomCode }); // Send the random code back to the frontend
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to send message" });
    });
});

// Define a route to verify the entered code
app.post("/verify-code", (req, res) => {
  const enteredCode = req.body.code; // Assuming the entered code is sent in the request body
  const sentCode = req.body.sentCode; // Assuming the sent code is sent in the request body
  if (enteredCode === sentCode) {
    res.json({ success: true, message: "Code verification successful" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid verification code" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
