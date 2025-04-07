import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./auth.js";
import authRoutes from "./authRoutes.js";
import journeyRoutes from "./journeysRoutes.js";
import { db } from "./db.js"; // Ensure db.js is properly imported

const app = express();

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secure_default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure journeys table includes startLocation and endLocation
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      startLocation TEXT NOT NULL,
      endLocation TEXT NOT NULL,
      distance REAL NOT NULL,
      mpg REAL NOT NULL,
      fuelCost REAL NOT NULL,
      date TEXT NOT NULL
    )
  `);
});

// Define Routes
app.use("/auth", authRoutes);
app.use("/api/journeys", journeyRoutes);

// Root endpoint to verify backend is running
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Debug route to check session status
app.get("/debug/session", (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated(), user: req.user || null });
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
