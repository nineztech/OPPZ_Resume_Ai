import Resume from "../models/resumeModel.js";
import User from "../models/userModel.js";

// Save new resume
export const saveResume = async (req, res) => {
  try {
    const { title, templateId, selectedColor, resumeData } = req.body;
    const userId = req.user.id; // From auth middleware

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
    res.status(500).json({ message: "Server error" });
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