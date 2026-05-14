# Deploy On Vercel

Use two Vercel projects from this same repository:

- `frontend` project: Vite React app
- `backend` project: Express API as Vercel Serverless Functions

You also need a hosted PostgreSQL database. A free Neon or Supabase Postgres database works well.

## 1. Create The Database

Create a PostgreSQL database on Neon or Supabase.

Run the SQL in:

```text
backend/schema.sql
```

Copy the database connection string. It should look like:

```text
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

## 2. Deploy Backend To Vercel

In Vercel:

1. Add New Project
2. Import this Git repository
3. Set Root Directory to:

```text
backend
```

4. Add environment variables:

```text
DATABASE_URL=your-postgres-connection-string
SESSION_SECRET=any-long-random-secret
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

5. Deploy.

After deployment, test:

```text
https://your-backend.vercel.app/health
```

Expected response:

```json
{ "status": "ok" }
```

## 3. Deploy Frontend To Vercel

In Vercel:

1. Add New Project
2. Import the same Git repository
3. Set Root Directory to:

```text
frontend
```

4. Framework Preset: Vite
5. Build Command:

```text
npm run build
```

6. Output Directory:

```text
dist
```

7. Add environment variable:

```text
VITE_API_URL=https://your-backend.vercel.app
```

8. Deploy.

## 4. Update Backend CLIENT_URL

After the frontend deploys, copy the frontend Vercel URL and update the backend project environment variable:

```text
CLIENT_URL=https://your-frontend.vercel.app
```

Redeploy the backend after changing it.

## 5. Test

Open the frontend Vercel URL and test:

- Register
- Login
- Create a team
- Add a member by name
- Create a task
- Edit task status

## Important Notes

- Do not use `localhost` in production environment variables.
- Backend and frontend are separate Vercel projects.
- The backend is now serverless-friendly through `backend/api/index.js`.
- Sessions are stored in PostgreSQL, so login can survive serverless cold starts.
