const pool = require("../config/db");

const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const newTeam = await pool.query(
      `INSERT INTO teams (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), req.user.id]
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
    const teams = await pool.query(
      `
      SELECT
        teams.*,
        COUNT(team_members.user_id)::int AS members_count
      FROM teams
      LEFT JOIN team_members
      ON team_members.team_id = teams.id
      GROUP BY teams.id
      ORDER BY teams.id DESC
      `
    );

    res.status(200).json(teams.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { user_id, name } = req.body;

    const { id } = req.params;

    if (!user_id && !name?.trim()) {
      return res.status(400).json({
        message: "Member name is required",
      });
    }

    const team = await pool.query(
      `SELECT * FROM teams WHERE id = $1`,
      [id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    let memberId = user_id;

    if (!memberId) {
      const user = await pool.query(
        `SELECT id, name
         FROM users
         WHERE LOWER(name) = LOWER($1)
         ORDER BY id ASC`,
        [name.trim()]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.rows.length > 1) {
        return res.status(400).json({
          message: "Multiple users found with that name. Please use a unique name.",
        });
      }

      memberId = user.rows[0].id;
    }

    const user = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [memberId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingMember = await pool.query(
      `SELECT * FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [id, memberId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        message: "User already added",
      });
    }

    await pool.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)`,
      [id, memberId]
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

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // optional safety: check if team exists
    const team = await pool.query(
      `SELECT * FROM teams WHERE id = $1`,
      [id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // delete members first (IMPORTANT if no cascade)
    await pool.query(
      `DELETE FROM team_members WHERE team_id = $1`,
      [id]
    );

    // then delete team
    await pool.query(
      `DELETE FROM teams WHERE id = $1`,
      [id]
    );

    return res.status(200).json({
      message: "Team deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createTeam,
  getTeams,
  addMember,
  deleteTeam,
};
