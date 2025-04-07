import express from "express";
import { addJourney, getJourneys, updateJourney, deleteJourney } from "./db.js";

const router = express.Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

// Add a new journey
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { startLocation, endLocation, distance, mpg, fuelCost, date } = req.body;
    const userId = req.user.googleId;

    if (!startLocation || !endLocation || !distance || !mpg || !fuelCost || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newJourney = await addJourney({ userId, startLocation, endLocation, distance, mpg, fuelCost, date });
    res.status(201).json({ message: "Journey added successfully", data: newJourney });
  } catch (error) {
    console.error("Error adding journey:", error);
    res.status(500).json({ error: "Failed to add journey" });
  }
});

// Get all journeys for the authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.googleId;
    const journeys = await getJourneys(userId);
    res.status(200).json(journeys);
  } catch (error) {
    console.error("Error fetching journeys:", error);
    res.status(500).json({ error: "Failed to fetch journeys" });
  }
});

// Update a journey
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { startLocation, endLocation, distance, mpg, fuelCost, date } = req.body;
    const userId = req.user.googleId;

    if (!startLocation || !endLocation || !distance || !mpg || !fuelCost || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedJourney = await updateJourney({ id, userId, startLocation, endLocation, distance, mpg, fuelCost, date });
    if (!updatedJourney) {
      return res.status(404).json({ error: "Journey not found" });
    }

    res.status(200).json({ message: "Journey updated successfully", data: updatedJourney });
  } catch (error) {
    console.error("Error updating journey:", error);
    res.status(500).json({ error: "Failed to update journey" });
  }
});

// Delete a journey
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.googleId;

    const result = await deleteJourney(id, userId);
    if (!result) {
      return res.status(404).json({ error: "Journey not found" });
    }

    res.status(200).json({ message: "Journey deleted successfully" });
  } catch (error) {
    console.error("Error deleting journey:", error);
    res.status(500).json({ error: "Failed to delete journey" });
  }
});

export default router;
