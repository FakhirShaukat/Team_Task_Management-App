const pool = require("../config/db");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      team_id,
      assigned_to,
      due_date,
    } = req.body;

    const newTask = await pool.query(
      `INSERT INTO tasks
      (title, description, team_id, assigned_to, due_date)
      
      VALUES ($1, $2, $3, $4, $5)
      
      RETURNING *`,
      [
        title,
        description,
        team_id,
        assigned_to,
        due_date,
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      task: newTask.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { team, assignee } = req.query;

    let query = `
      SELECT tasks.*, users.name AS assigned_user
      FROM tasks
      LEFT JOIN users
      ON tasks.assigned_to = users.id
    `;

    const values = [];

    if (team) {
      values.push(team);

      query += ` WHERE tasks.team_id = $1`;
    }

    if (assignee) {
      values.push(assignee);

      query += values.length === 1
        ? ` WHERE tasks.assigned_to = $1`
        : ` AND tasks.assigned_to = $2`;
    }

    query += ` ORDER BY tasks.id DESC`;

    const tasks = await pool.query(query, values);

    res.status(200).json(tasks.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      assigned_to,
      due_date,
    } = req.body;

    const updatedTask = await pool.query(
      `UPDATE tasks
      
      SET
      title = $1,
      description = $2,
      status = $3,
      assigned_to = $4,
      due_date = $5
      
      WHERE id = $6
      
      RETURNING *`,
      [
        title,
        description,
        status,
        assigned_to,
        due_date,
        id,
      ]
    );

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};