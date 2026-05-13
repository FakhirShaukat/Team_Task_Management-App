const pool = require("../config/db");

const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    const newTeam = await pool.query(
      `INSERT INTO teams (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name, req.user.id]
    );

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await pool.query(`
      SELECT * FROM teams
      ORDER BY id DESC
    `);

    res.status(200).json(teams.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { user_id } = req.body;

    const { id } = req.params;

    const existingMember = await pool.query(
      `SELECT * FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        message: "User already added",
      });
    }

    await pool.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)`,
      [id, user_id]
    );

    res.status(200).json({
      message: "Member added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTeam,
  getTeams,
  addMember,
};