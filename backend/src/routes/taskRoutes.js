const express = require("express");

const router = express.Router();

const isAuthenticated = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", isAuthenticated, createTask);

router.get("/", isAuthenticated, getTasks);

router.put("/:id", isAuthenticated, updateTask);

router.delete("/:id", isAuthenticated, deleteTask);

module.exports = router;