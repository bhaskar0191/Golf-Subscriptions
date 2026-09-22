# Golf Subscription Frontend

The frontend is a React and TypeScript application powered by Vite. It connects to the Express API in `../backend` and provides public, subscriber, and admin experiences.

## Run

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Environment

Create `.env` in this directory:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_LOGIN_URL=http://localhost:5000/api/auth/login
VITE_BACKEND_REGISTER_URL=http://localhost:5000/api/auth/register
VITE_BACKEND_SUBSCRIPTION_PLANS_URL=http://localhost:5000/api/subscriptions/plans
```

All client-visible Vite variables must start with `VITE_`. Restart Vite after changing them.

## Routes

- `/` - Landing page
- `/login` - Login
- `/register` - Subscriber registration
- `/dashboard` - Member dashboard and charity selection
- `/score-entry` - Add a round
- `/score-edit/:id` - Update an existing round
- `/draw` - Member draw view
- `/admin` - Admin dashboard
- `/admin/draw` - Draw management

## Features

- JWT login and registration through the shared auth context
- Role-aware subscriber and admin navigation
- Toast notifications for authentication, charity, and score actions
- Charity selection through `POST /api/charities/select`
- Score creation and updates through `POST /api/scores` and `PUT /api/scores/:id`
- Live dashboard data from the backend API

## Scripts

```bash
npm run dev       # Start the development server
npm run build     # Type-check and build for production
npm run lint      # Run Oxlint
npm run preview   # Preview the production build
```

The complete full-stack setup and API reference is documented in the repository root [`README.md`](../README.md).
