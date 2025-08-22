import { sequelize } from "../config/dbConnection.js";
import User from "./userModel.js";
import Resume from "./resumeModel.js";

// Define associations here if needed
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    // Force: true will drop existing tables and recreate them
    // In production, you should use { alter: true } or { force: false }
    await sequelize.sync({ force: false });
    console.log("✅ Database models synchronized successfully!");
  } catch (error) {
    console.error("❌ Error syncing database models:", error);
    throw error;
  }
};

export { User, Resume, sequelize, syncDatabase };
