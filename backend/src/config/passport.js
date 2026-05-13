const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const pool = require("./db");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (user.rows.length === 0) {
          return done(null, false, {
            message: "Invalid email",
          });
        }

        const validPassword = await bcrypt.compare(
          password,
          user.rows[0].password
        );

        if (!validPassword) {
          return done(null, false, {
            message: "Invalid password",
          });
        }

        return done(null, user.rows[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );

    done(null, user.rows[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;