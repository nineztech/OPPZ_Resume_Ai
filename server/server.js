import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import colors from "colors";
import { connectDB } from "./config/dbConnection.js"; // Adjust path as needed
import authMiddleware from "./middleware/auth.js"; // Adjust path as needed
import router from "./routes/index.js"; // Adjust path as needed
import { syncDatabase } from "./models/index.js"; // Import sync function
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

//routes
app.use("/api", router); // Use the index route for all requests

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(colors.red("Error:"), err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await syncDatabase(); // Sync models with database
    app.listen(PORT, () => {
      console.log(colors.cyan(`🚀 Server running on port ${PORT}`));
    });
  } catch (error) {
    console.error(colors.red("❌ Failed to start server:"), error);
    process.exit(1);
  }
};

startServer();
