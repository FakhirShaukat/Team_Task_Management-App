const express = require("express");

const router = express.Router();

const isAuthenticated = require("../middleware/authMiddleware");

const {
  createTeam,
  getTeams,
  addMember,
} = require("../controllers/teamController");

router.post("/", isAuthenticated, createTeam);

router.get("/", isAuthenticated, getTeams);

router.post("/:id/members", isAuthenticated, addMember);

module.exports = router;