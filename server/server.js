import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import colors from "colors";
import bodyParser from 'body-parser';

import { connectDB } from "./config/dbConnection.js";
import { syncDatabase } from "./models/index.js";

import router from "./routes/index.js";
import resumeRoutes from './routes/resumeRoutes.js';

dotenv.config(); // ✅ Load environment variables first

const app = express(); // ✅ Define app before using it
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json()); // ✅ Parse JSON body
app.use(express.json())
// ✅ Serve static files (like templates)
app.use('/templates', express.static('templates'));

// ✅ Basic health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// ✅ Route registration
app.use("/api", router);
app.use("/api/resume", resumeRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(colors.red("Error:"), err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ Start the server and sync DB
const startServer = async () => {
  try {
    await connectDB();
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(colors.cyan(`🚀 Server running on port ${PORT}`));
    });
  } catch (error) {
    console.error(colors.red("❌ Failed to start server:"), error);
    process.exit(1);
  }
};

startServer(); // ✅ Only this, no duplicate app.listen
