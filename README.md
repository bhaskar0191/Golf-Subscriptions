# Golf Subscription Platform

A full-stack golf membership application for tracking rounds, managing subscriptions, selecting charities, and participating in monthly draws.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Notifications: React Toastify
- API client: Axios and Fetch

## Project Structure

```text
backend/       Express API and MongoDB models
frontend/      React and TypeScript application
postman/       API collections, environments, mocks, and specifications
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string
- npm

## Configuration

### Backend

Create `backend/.env`:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/golf-subscripation
JWT_SECRET=replace-with-a-long-random-secret
```

`MONGO_URI` defaults to the local value shown above when omitted. Do not commit `.env` files or real secrets.

### Frontend

The frontend currently uses these root-level Vite variables in `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_LOGIN_URL=http://localhost:5000/api/auth/login
VITE_BACKEND_REGISTER_URL=http://localhost:5000/api/auth/register
VITE_BACKEND_SUBSCRIPTION_PLANS_URL=http://localhost:5000/api/subscriptions/plans
```

Vite only exposes variables prefixed with `VITE_`. Restart the frontend dev server after changing this file.

## Run Locally

Open two terminals from the repository root.

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app runs at `http://localhost:5173`.

## Available Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Type-check and create production build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build
```

### Backend

```bash
npm run dev       # Start the Express server
npm start         # Start the Express server
```

## Authentication and Roles

Register and login use:

```text
POST /api/auth/register
POST /api/auth/login
```

Successful authentication returns a JWT and a user object. Send the token on protected requests:

```http
Authorization: Bearer YOUR_TOKEN
```

Supported roles are:

- `subscriber`: normal member access
- `admin`: administrative dashboard and management access

Public registration creates a subscriber account. The first admin must be created securely in MongoDB by changing an existing user role, or by an existing admin using `POST /api/auth/admin/register`.

After promoting the first account, sign in at `http://localhost:5173/login`; admin users are redirected to `/admin`.

## API Routes

All routes below use the `http://localhost:5000/api` prefix.

### Authentication

- `POST /auth/register` - Register a subscriber
- `POST /auth/login` - Login
- `POST /auth/admin/register` - Create an admin; existing admin token required

### Users

- `GET /users/profile` - Get the authenticated profile
- `PUT /users/profile` - Update the authenticated profile
- `POST /users/subscribe` - Subscribe to the platform

### Scores

- `POST /scores` - Add a round
- `PUT /scores/:id` - Update an owned round
- `GET /scores/user/:userId` - Get a user's scores

### Charities

- `GET /charities` - List active charities
- `POST /charities/select` - Select a charity as a subscriber
- `POST /charities` - Create a charity as an admin

The selection request body is:

```json
{
  "charityId": "CHARITY_ID"
}
```

### Subscriptions

- `GET /subscriptions/plans` - List plans
- `GET /subscriptions/me` - Get current subscription
- `POST /subscriptions/checkout` - Create a subscription
- `POST /subscriptions/cancel` - Cancel a subscription
- `POST /subscriptions/renew` - Renew a subscription
- `GET /subscriptions/payments` - Get payment history

### Draws

- `GET /draws/info` - Get draw information
- `POST /draws/join` - Join a draw as a subscriber
- `GET /draws/results` - Get draw results
- `POST /draws` - Create a draw as an admin
- `POST /draws/verify` - Verify winners as an admin
- `POST /draws/proof` - Upload winner proof as a subscriber

### Reports

- `GET /reports/users` - User report for admins
- `GET /reports/draws` - Draw report for admins
- `GET /reports/charities` - Charity report for admins

### Health Check

```text
GET http://localhost:5000/
```

Expected response:

```json
{
  "message": "Golf Subscription API is running"
}
```

## Frontend Pages

- `/` - Public landing page
- `/login` - Login
- `/register` - Subscriber registration
- `/dashboard` - Member dashboard, charity selection, and score history
- `/score-entry` - Add a golf round
- `/score-edit/:id` - Update an owned score
- `/draw` - Member draw view
- `/admin` - Admin dashboard
- `/admin/draw` - Admin draw engine

## First Admin Setup

1. Register a normal account.
2. Promote that account in MongoDB:

```js
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. Login at `http://localhost:5173/login`.
4. Use the returned admin session to create additional admins through the protected API.

## Verification

From `frontend/`, run:

```bash
npm run build
npm run lint
```

The backend currently has no automated test script; use the Postman assets in `postman/` to exercise API workflows.
