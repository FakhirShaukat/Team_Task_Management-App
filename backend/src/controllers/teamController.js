const pool = require("../config/db");
const { ensureTeamMemberByName } = require("../utils/memberResolver");

const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const client = await pool.connect();

    let team;

    try {
      await client.query("BEGIN");

      const newTeam = await client.query(
        `INSERT INTO teams (name, created_by)
         VALUES ($1, $2)
         RETURNING *`,
        [name.trim(), req.user.id]
      );

      team = newTeam.rows[0];

      await client.query(
        `INSERT INTO team_members (team_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [team.id, req.user.id]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      message: "Team created successfully",
      team,
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
      WHERE teams.created_by = $1
        OR EXISTS (
          SELECT 1
          FROM team_members current_member
          WHERE current_member.team_id = teams.id
            AND current_member.user_id = $1
        )
      GROUP BY teams.id
      ORDER BY teams.id DESC
      `,
      [req.user.id]
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
      `SELECT * FROM teams WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found or you do not have permission to add members",
      });
    }

    let memberId = user_id;

    if (!memberId) {
      const member = await ensureTeamMemberByName(pool, id, name);

      return res.status(200).json({
        message: "Member added successfully",
        member,
      });
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

const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

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
      [id, req.user.id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found or you do not have access to it",
      });
    }

    const members = await pool.query(
      `SELECT DISTINCT users.id, users.name, users.email
       FROM users
       LEFT JOIN team_members
       ON team_members.user_id = users.id
       LEFT JOIN teams
       ON teams.created_by = users.id
       WHERE team_members.team_id = $1
          OR teams.id = $1
       ORDER BY users.name ASC`,
      [id]
    );

    res.status(200).json(members.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await pool.query(
      `SELECT * FROM teams WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (team.rows.length === 0) {
      return res.status(404).json({
        message: "Team not found or you do not have permission to delete it",
      });
    }

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
  getTeamMembers,
  deleteTeam,
};
