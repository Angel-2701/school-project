// userController.js
const Project = require("../models/project");

exports.projects = async (req, res) => {
  try {
    // Fetch all projects from the database
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const newData = req.body;

    // Find the project by ID and update it with the new data
    const updatedProject = await Project.findByIdAndUpdate(projectId, newData, {
      new: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find the project by ID and delete it
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createProject = async (req, res) => {
  try {
    // Extract project data from the request body
    const { company, name, _id } = req.body;

    // Create a new project instance with only required fields
    const newProject = new Project({
      company,
      name,
      _id,
    });

    // Save the new project to the database
    const savedProject = await newProject.save();

    // Send the saved project as a response
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a project by ID
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find the project by its ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
