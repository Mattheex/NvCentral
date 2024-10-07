import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import addRoutes from "./routes/add.js";
import searchRoutes from "./routes/search.js";
import authRoutes from "./routes/auth.js";
import getRoutes from "./routes/get.js";
import uploadRoutes from "./routes/upload.js";
import fs from "fs";
import path from "path"

const app = express();
const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  console.log(`NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`secretKEY=${process.env.secretKEY}`);
  console.log(`smtpPass=${process.env.smtpPass}`);
}

app.use("/add", addRoutes);
app.use("/search", searchRoutes);
app.use("/auth", authRoutes);
app.use("/get", getRoutes);
app.use("/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(port, () => console.log("Server is running on port 5000"));
