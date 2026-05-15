const pool = require("../config/db");
const { ensureTeamMemberByName } = require("../utils/memberResolver");

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

const ensureTaskAssigneesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (task_id, user_id)
    )
  `);
};

const parseAssignedNames = (body) => {
  const names = Array.isArray(body.assigned_names)
    ? body.assigned_names
    : String(body.assigned_names || body.assigned_name || "")
        .split(",");

  return names
    .map((name) => name.trim())
    .filter(Boolean);
};

const resolveAssignees = async (teamId, body) => {
  const assignedIds = Array.isArray(body.assigned_to)
    ? body.assigned_to.filter(Boolean)
    : body.assigned_to
      ? [body.assigned_to]
      : [];

  const assignedNames = parseAssignedNames(body);
  const assignees = [];

  for (const assignedId of assignedIds) {
    const member = await pool.query(
      `SELECT users.id, users.name
       FROM users
       WHERE users.id = $2
         AND (
           EXISTS (
             SELECT 1
             FROM team_members
             WHERE team_members.team_id = $1
               AND team_members.user_id = users.id
           )
           OR EXISTS (
             SELECT 1
             FROM teams
             WHERE teams.id = $1
               AND teams.created_by = users.id
           )
         )`,
      [teamId, assignedId]
    );

    if (member.rows.length === 0) {
      throw new Error("Assigned user must be a member of the selected team");
    }

    assignees.push(member.rows[0]);
  }

  for (const assignedName of assignedNames) {
    assignees.push(await ensureTeamMemberByName(pool, teamId, assignedName));
  }

  const uniqueAssignees = Array.from(
    new Map(assignees.map((assignee) => [Number(assignee.id), assignee])).values()
  );

  if (uniqueAssignees.length === 0) {
    throw new Error("Title, team, and assigned member are required");
  }

  return uniqueAssignees;
};

const saveTaskAssignees = async (taskId, assignees) => {
  await ensureTaskAssigneesTable();
  await pool.query("DELETE FROM task_assignees WHERE task_id = $1", [taskId]);

  for (const assignee of assignees) {
    await pool.query(
      `INSERT INTO task_assignees (task_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [taskId, assignee.id]
    );
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      team_id,
      due_date,
      status = "pending",
    } = req.body;

    if (!title || !team_id || parseAssignedNames(req.body).length === 0 && !req.body.assigned_to) {
      return res.status(400).json({
        message: "Title, team, and assigned member are required",
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

    const assignees = await resolveAssignees(team_id, req.body);

    const newTask = await pool.query(
      `INSERT INTO tasks
      (title, description, team_id, assigned_to, due_date, status)
      
      VALUES ($1, $2, $3, $4, $5, $6)
      
      RETURNING *`,
      [
        title,
        description,
        team_id,
        assignees[0].id,
        due_date,
        status,
      ]
    );

    await saveTaskAssignees(newTask.rows[0].id, assignees);

    res.status(201).json({
      message: "Task created successfully",
      task: {
        ...newTask.rows[0],
        assignees,
        assigned_user: assignees.map((assignee) => assignee.name).join(", "),
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("required") || error.message.includes("member")
      ? 400
      : 500;

    res.status(statusCode).json({
      message: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { team, assignee } = req.query;

    await ensureTaskAssigneesTable();

    let query = `
      SELECT
        tasks.*,
        COALESCE(
          STRING_AGG(DISTINCT assignee_users.name, ', ') FILTER (WHERE assignee_users.id IS NOT NULL),
          users.name
        ) AS assigned_user,
        COALESCE(
          JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', assignee_users.id, 'name', assignee_users.name))
            FILTER (WHERE assignee_users.id IS NOT NULL),
          '[]'
        ) AS assignees
      FROM tasks
      LEFT JOIN users
      ON tasks.assigned_to = users.id
      LEFT JOIN task_assignees
      ON task_assignees.task_id = tasks.id
      LEFT JOIN users assignee_users
      ON assignee_users.id = task_assignees.user_id
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

      query += ` AND (
        tasks.assigned_to = $${values.length}
        OR task_assignees.user_id = $${values.length}
      )`;
    }

    query += ` GROUP BY tasks.id, users.name ORDER BY tasks.id DESC`;

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

    const assignees = await resolveAssignees(existingTask.rows[0].team_id, req.body);

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
        assignees[0].id,
        due_date,
        id,
      ]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await saveTaskAssignees(id, assignees);

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        ...updatedTask.rows[0],
        assignees,
        assigned_user: assignees.map((assignee) => assignee.name).join(", "),
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("required") || error.message.includes("member")
      ? 400
      : 500;

    res.status(statusCode).json({
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
