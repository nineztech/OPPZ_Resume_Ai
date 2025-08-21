import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";

// Save new resume
// Save new resume
export const saveResume = async (req, res) => {
  try {
    // Add debugging to check if req.body exists
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers['content-type']);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ 
        message: "Request body is missing. Ensure Content-Type is application/json" 
      });
    }

    const { title, templateId, selectedColor, resumeData } = req.body;

    // Validate required fields
    if (!title || !templateId || !resumeData) {
      return res.status(400).json({ 
        message: "Missing required fields",
        received: { title: !!title, templateId: !!templateId, resumeData: !!resumeData }
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id; // set by auth middleware

    const resume = await Resume.create({
      userId,
      title,
      templateId,
      selectedColor,
      resumeData
    });

    res.status(201).json({ 
      message: "Resume saved successfully", 
      resume 
    });
  } catch (error) {
    console.error("Save resume error:", error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: error.message 
      });
    }
    
    if (error.name === 'SequelizeError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: "Database error", 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }

    res.status(500).json({ 
      message: "Server error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update existing resume
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, templateId, selectedColor, resumeData } = req.body;
    const userId = req.user.id;

    const resume = await Resume.findOne({ 
      where: { id, userId } 
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await resume.update({
      title,
      templateId,
      selectedColor,
      resumeData,
      lastEdited: new Date()
    });

    res.status(200).json({ 
      message: "Resume updated successfully", 
      resume 
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's resumes
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const resumes = await Resume.findAll({
      where: { userId, isActive: true },
      order: [['lastEdited', 'DESC']]
    });

    res.status(200).json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific resume
export const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId, isActive: true }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete resume (soft delete)
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    await resume.update({ isActive: false });

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Server error" });
  }
};