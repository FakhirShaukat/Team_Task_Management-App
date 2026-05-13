require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);

require("./config/passport");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");  

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* SESSION MIDDLEWARE */
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* PASSPORT MIDDLEWARE */
app.use(passport.initialize());

app.use(passport.session());

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);
app.use("/tasks", taskRoutes);

module.exports = app;