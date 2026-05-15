const express = require("express");

const router = express.Router();

const isAuthenticated = require("../middleware/authMiddleware");

const {
  createTeam,
  getTeams,
  addMember,
  getTeamMembers,
  deleteTeam,
} = require("../controllers/teamController");

router.post("/", isAuthenticated, createTeam);

router.get("/", isAuthenticated, getTeams);

router.get("/:id/members", isAuthenticated, getTeamMembers);

router.post("/:id/members", isAuthenticated, addMember);

router.delete("/:id", isAuthenticated, deleteTeam);

module.exports = router;
