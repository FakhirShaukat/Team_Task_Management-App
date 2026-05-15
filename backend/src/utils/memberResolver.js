const bcrypt = require("bcrypt");
const crypto = require("crypto");

const normalizeName = (name) => name?.trim();

const makePlaceholderEmail = (name) => {
  const slug = normalizeName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "member";

  return `${slug}-${crypto.randomBytes(6).toString("hex")}@worksphere.local`;
};

const findUserByName = async (pool, name) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const user = await pool.query(
    `SELECT id, name, email
     FROM users
     WHERE LOWER(TRIM(name)) = LOWER($1)
     ORDER BY id ASC
     LIMIT 1`,
    [normalizedName]
  );

  return user.rows[0] || null;
};

const createPlaceholderUser = async (pool, name) => {
  const normalizedName = normalizeName(name);
  const password = crypto.randomBytes(18).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [normalizedName, makePlaceholderEmail(normalizedName), hashedPassword]
  );

  return user.rows[0];
};

const ensureUserByName = async (pool, name) => {
  const existingUser = await findUserByName(pool, name);

  if (existingUser) {
    return existingUser;
  }

  return createPlaceholderUser(pool, name);
};

const findTeamMemberByName = async (pool, teamId, name) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const member = await pool.query(
    `SELECT users.id, users.name, users.email
     FROM users
     WHERE LOWER(TRIM(users.name)) = LOWER($2)
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
       )
     ORDER BY users.id ASC
     LIMIT 1`,
    [teamId, normalizedName]
  );

  return member.rows[0] || null;
};

const ensureTeamMemberByName = async (pool, teamId, name) => {
  const existingMember = await findTeamMemberByName(pool, teamId, name);

  if (existingMember) {
    return existingMember;
  }

  const user = await ensureUserByName(pool, name);

  await pool.query(
    `INSERT INTO team_members (team_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [teamId, user.id]
  );

  return user;
};

module.exports = {
  ensureTeamMemberByName,
  ensureUserByName,
  findTeamMemberByName,
};
