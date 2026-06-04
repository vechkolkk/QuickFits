# QuickFit

QuickFit is a beginner-friendly fitness and habit tracker built from the PRD/ADS in this workspace. It includes user authentication, workout logging, routine planning, habit streaks, dashboard stats, and reminder preferences.

## Tech Stack

- Frontend: React, Vite, React Router, Recharts, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Deployment target: AWS Amplify or S3/CloudFront for frontend, AWS Elastic Beanstalk for backend, MongoDB Atlas for database

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

3. Update `server/.env` with your MongoDB connection string and JWT secret.

4. Start both apps:

   ```bash
   npm run dev
   ```

5. Open the frontend at `http://localhost:5173`.

## Features Included

- Account registration, login, JWT sessions, and profile editing
- Workout logging with exercise sets, reps, weight, duration, and notes
- Habit creation, daily check-ins, reminder preferences, and streak tracking
- Weekly routine builder
- Dashboard summary cards, recent activity, and progress charts

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Project Structure

```text
client/   React app
server/   Express API
docs/     Deployment guide
```

## Deployment

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for step-by-step AWS deployment instructions.

For EC2 dev-port troubleshooting, see [docs/EC2_TROUBLESHOOTING.md](docs/EC2_TROUBLESHOOTING.md).
