# WorkSphere

A modern full-stack Team Task Management web application built with React, Node.js, Express, PostgreSQL, Passport.js authentication, and Tailwind CSS.
WorkSphere helps teams manage projects, assign tasks, track progress, and collaborate efficiently.

# Features

## Authentication
- User Registration
- User Login
- Session-based Authentication
- Protected Routes
- Logout Functionality
- Password Hashing using bcrypt

## Dashboard
- Task Statistics
- Completed Tasks
- Pending Tasks
- In Progress Tasks
- Recent Tasks
- Teams Overview

## Task Management
- Create Tasks
- View Tasks
- Filter Tasks
- Search Tasks
- Task Status Tracking
- Assign Tasks to Teams
- Due Dates

## Team Management
- Create Teams
- View Teams
- Team Members
- Team Organization

# Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS
- Vite

## Backend
- Node.js
- Express.js
- PostgreSQL
- Passport.js
- Express Session
- Connect PG Simple
- bcrypt

## Database
- PostgreSQL (Supabase)

# Folder Structure

```bash
WorkSphere/
│
├── backend/
│   ├── api/
│   │   └── index.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── passport.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   └── teamController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── teamRoutes.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   ├── vercel.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterUser.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   └── Teams.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
└── README.md
```

Installation Guide:

1. Clone Repository
git clone https://github.com/your-username/worksphere.git

3. Frontend Setup
cd frontend
npm install
Frontend Dependencies
npm install react-router-dom axios
Tailwind CSS Setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Start Frontend
npm run dev

Frontend runs on:
http://localhost:5173

3. Backend Setup
cd backend
npm install
Backend Dependencies
npm install express cors dotenv pg bcrypt passport passport-local express-session connect-pg-simple
Dev Dependency
npm install --save-dev nodemon
Start Backend
npm run dev

Backend runs on:
http://localhost:5000

4. Environment Variables

Create a .env file inside backend folder.
PORT=5000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secret_key

5. PostgreSQL Tables
Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);
Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_by INTEGER REFERENCES users(id)
);
Team Members Table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    user_id INTEGER REFERENCES users(id)
);
Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INTEGER REFERENCES users(id),
    team_id INTEGER REFERENCES teams(id),
    due_date DATE
);

6. Authentication Flow

WorkSphere uses:

Passport Local Strategy
Express Sessions
PostgreSQL Session Store
HTTP-only Cookies

Authentication is session-based.

API Routes
Auth Routes
Method	Endpoint	Description
POST	/auth/register	Register User
POST	/auth/login	Login User
POST	/auth/logout	Logout User
Team Routes
Method	Endpoint	Description
GET	/teams	Get all teams
POST	/teams	Create team
DELETE	/teams/:id	Delete team
Task Routes
Method	Endpoint	Description
GET	/tasks	Get all tasks
POST	/tasks	Create task
PUT	/tasks/:id	Update task
DELETE	/tasks/:id	Delete task
Deployment
Frontend

Deploy frontend on:

Vercel
Backend

Deploy backend on:

Vercel Serverless Functions
Backend Vercel Setup

Inside backend/api/index.js

const app = require("../src/app");

module.exports = app;
Build Commands
Frontend Build
npm run build
Git Ignore
Backend .gitignore
node_modules
.env
.vercel
Frontend .gitignore
node_modules
dist
.vercel
Future Improvements
Google Authentication
Real-time Notifications
Drag & Drop Tasks
Team Invitations
Role-based Access
File Uploads
Activity Logs
Dark Mode
Mobile App
Author

Developed by Fakhir Shaukat.

License

This project is licensed for educational and portfolio purposes.
