# Expense Tracker

A full-stack expense management experience composed of a React + Material UI client, an Express/MongoDB API, JWT auth, role-based routing (user/admin), analytics dashboards, and Google One Tap sign-in.

## Stack

- **Frontend**: React 19 (CRA), React Router, Material UI, Recharts.
- **Backend**: Node.js/Express, MongoDB/Mongoose, JWT, bcrypt.
- **Auth**: Email/password + Google Identity Services, role tag controls admin access.

## Features

- Secure registration/login with JWT persistence.
- Google sign-in (One Tap/button) for passwordless onboarding.
- User dashboard: capture transactions, edit/delete inline, analytics cards, charts.
- Admin dashboard: global totals, top categories, latest activity table.
- Role-aware routing (`/dashboard` for users, `/admin` for admins).

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or hosted)
- Google Cloud OAuth Client ID (Web application)

## Environment Variables

Create `.env` files from the provided samples:

`server/.env`
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=your-super-secret
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

`client/.env`
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> Whoever registers/logs in with `ADMIN_EMAIL` automatically receives the `admin` role and gains access to `/admin`.

## Setup & Scripts

```bash
# install deps
cd server && npm install
cd ../client && npm install

# run backend (from /server)
npm start

# run frontend (from /client)
npm start
```

Build the production bundle via `npm run build` inside `client`. The backend exposes REST endpoints under `/api`.

## Google Sign-In

1. In Google Cloud Console create an OAuth client (type: Web) and copy the client ID.
2. Add your allowed origins (e.g. `http://localhost:3000`) under **Authorized JavaScript origins**.
3. Paste the client ID into both `.env` files as shown above.
4. Restart server/client.

## Deployment Notes

- Set `CLIENT_URL` to your deployed frontend origin so CORS remains strict.
- Provide production MongoDB URI & strong `JWT_SECRET`.
- Consider enabling HTTPS for Google sign-in in production (required for One Tap outside localhost).

## License

MIT

