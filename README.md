# CampusBridge

CampusBridge is a scalable MERN multi-college community platform for verified student ecosystems.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Lucide
- Backend: Node.js, Express, Mongoose, JWT auth, Joi validation
- Database: MongoDB Atlas
- Security: bcrypt, Helmet, rate limiting, CORS, mongo sanitization, HPP

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.

3. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

4. Run the apps in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

## Deployment

- Deploy `frontend` to Vercel with `VITE_API_URL` pointing at the API URL.
- Deploy `backend` to Render, Railway, AWS, or similar with MongoDB Atlas connection variables.
- Use strong JWT secrets in production.
- Set `CLIENT_URL` to the deployed frontend origin.

## Architecture

The backend follows Route -> Controller -> Service -> Model -> Database. Domain rules live in services, routes stay declarative, and controllers only translate HTTP concerns.

The frontend uses API modules, auth context, route guards, layouts, reusable UI components, and focused page modules.
