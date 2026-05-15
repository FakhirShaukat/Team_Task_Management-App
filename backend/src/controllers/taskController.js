const pool = require("../config/db");

const accessibleTeamCondition = `
  (
    teams.created_by = $1
    OR EXISTS (
      SELECT 1
      FROM team_members current_member
      WHERE current_member.team_id = teams.id
        AND current_member.user_id = $1
    )
  )
`;

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      team_id,
      assigned_to,
      due_date,
      status = "pending",
    } = req.body;

    if (!title || !team_id || !assigned_to) {
      return res.status(400).json({
        message: "Title, team, and assigned user are required",
      });
    }

    const team = await pool.query(
      `SELECT id FROM teams
       WHERE id = $1
         AND (
           created_by = $2
           OR EXISTS (
             SELECT 1
             FROM team_members current_member
             WHERE current_member.team_id = teams.id
               AND current_member.user_id = $2
           )
         )`,
      [team_id, req.user.id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found or you do not have access to it",
      });
    }

    const member = await pool.query(
      `SELECT 1
       FROM teams
       WHERE id = $1
         AND (
           created_by = $2
           OR EXISTS (
             SELECT 1
             FROM team_members
             WHERE team_members.team_id = teams.id
               AND team_members.user_id = $2
           )
         )`,
      [team_id, assigned_to]
    );

    if (member.rows.length === 0) {
      return res.status(400).json({
        message: "Assigned user must be a member of the selected team",
      });
    }

    const newTask = await pool.query(
      `INSERT INTO tasks
      (title, description, team_id, assigned_to, due_date, status)
      
      VALUES ($1, $2, $3, $4, $5, $6)
      
      RETURNING *`,
      [
        title,
        description,
        team_id,
        assigned_to,
        due_date,
        status,
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
      INNER JOIN teams
      ON tasks.team_id = teams.id
      WHERE ${accessibleTeamCondition}
    `;

    const values = [req.user.id];

    if (team) {
      values.push(team);

      query += ` AND tasks.team_id = $${values.length}`;
    }

    if (assignee) {
      values.push(assignee);

      query += ` AND tasks.assigned_to = $${values.length}`;
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

    const existingTask = await pool.query(
      `SELECT tasks.team_id
       FROM tasks
       INNER JOIN teams
       ON tasks.team_id = teams.id
       WHERE tasks.id = $1
         AND (
           teams.created_by = $2
           OR EXISTS (
             SELECT 1
             FROM team_members current_member
             WHERE current_member.team_id = teams.id
               AND current_member.user_id = $2
           )
         )`,
      [id, req.user.id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found or you do not have access to it",
      });
    }

    const member = await pool.query(
      `SELECT 1
       FROM teams
       WHERE id = $1
         AND (
           created_by = $2
           OR EXISTS (
             SELECT 1
             FROM team_members
             WHERE team_members.team_id = teams.id
               AND team_members.user_id = $2
           )
         )`,
      [existingTask.rows[0].team_id, assigned_to]
    );

    if (member.rows.length === 0) {
      return res.status(400).json({
        message: "Assigned user must be a member of the selected team",
      });
    }

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

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

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

    const deletedTask = await pool.query(
      `DELETE FROM tasks
       USING teams
       WHERE tasks.id = $1
         AND tasks.team_id = teams.id
         AND (
           teams.created_by = $2
           OR EXISTS (
             SELECT 1
             FROM team_members current_member
             WHERE current_member.team_id = teams.id
               AND current_member.user_id = $2
           )
         )
       RETURNING tasks.id`,
      [id, req.user.id]
    );

    if (deletedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

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
