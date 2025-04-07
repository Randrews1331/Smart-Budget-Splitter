import express from "express";
import passport from "./auth.js";

const router = express.Router();

// Google Authentication Route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    accessType: "offline",
  })
);
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/",
  }),
  (req, res) => {
    console.log("User authenticated:", req.user);
    res.redirect("http://localhost:3000/");
  }
);


export default router;
