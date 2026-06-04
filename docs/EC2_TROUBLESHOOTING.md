# EC2 Troubleshooting

## Symptom: Register Shows "Something went wrong"

If the React app loads but registration fails, the frontend usually cannot reach the backend API.

For an EC2 instance with public IP `13.220.0.77`, use this setup:

### Backend Environment

Create `server/.env` on EC2:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://13.220.0.77:5173
```

`CLIENT_URL` is the frontend origin. It should not be the API URL.

### Frontend Environment

Create `client/.env` on EC2:

```env
VITE_API_URL=http://13.220.0.77:5000/api
```

`VITE_API_URL` must include `/api`.

Restart the app after changing env files:

```bash
npm run dev
```

Open:

```text
http://13.220.0.77:5173
```

## EC2 Security Group

For this dev setup, the EC2 security group must allow inbound TCP traffic:

- `5173` for the Vite frontend
- `5000` for the Express backend API
- `22` for SSH

For a real deployment, put the app behind ports `80`/`443` with Nginx or a load balancer instead of exposing dev ports.

## MongoDB Atlas

MongoDB Atlas must allow connections from the EC2 public IP. In Atlas:

1. Open Network Access.
2. Add the EC2 public IP address.
3. Confirm the database username and password are correct.

## Quick Checks

From your own computer:

```text
http://13.220.0.77:5000/health
```

Expected response:

```json
{"status":"ok","service":"quickfit-api"}
```

If this URL does not load, the backend is not reachable from the internet.
