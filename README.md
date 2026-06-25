# Attendance Management System

Full-stack MERN application for employee attendance tracking with live selfie verification, geolocation capture, role-based access control, overtime workflow, and attendance validation.


## Tech Stack

| Layer    | Technology                                                         |
| -------- | ------------------------------------------------------------------ |
| Frontend | React (Vite), Redux Toolkit, RTK Query, React Router, Tailwind CSS |
| Backend  | Node.js, Express.js                                                |
| Database | MongoDB (Mongoose)                                                 |
| Logging  | Winston + Morgan                                                   |
| Auth     | JWT, bcrypt                                                        |

## Architecture Overview

```
┌─────────────────┐     REST API (JWT)     ┌─────────────────┐
│  React Frontend │ ◄────────────────────► │ Express Backend │
│  Redux + RTK Q  │                        │  Controllers    │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                            ┌───────▼────────┐
                                            │    MongoDB     │
                                            │ Users, Attend. │
                                            └────────────────┘
```

**Folder structure**

- `Frontend/` — Vite React app with feature-based Redux slices
- `Backend/src/` — Express API (controllers, models, routes, middleware)

**Roles**

| Role     | Capabilities                                                      |
| -------- | ----------------------------------------------------------------- |
| Employee | Punch in/out, view own attendance & reports, request overtime     |
| Manager  | Team attendance, verify selfies, approve/reject OT, daily reports |
| Admin    | All manager features + user management + system-wide attendance   |

## Features Implemented

### Core (Required)

- [x] Secure login & signup (JWT)
- [x] Role-based access control (frontend + backend)
- [x] Punch in / punch out with live camera selfie (no file upload)
- [x] Geolocation capture (lat/lng)
- [x] Working hours calculation (8-hour standard shift)
- [x] Completed (≥8h) / Incomplete (<8h) status display
- [x] Overtime request & approval workflow
- [x] Role-specific dashboards
- [x] Attendance validation (valid/invalid + remarks)
- [x] Daily attendance reports with filters & Excel export

### Good to Have

- [x] Date range filters
- [x] Pagination
- [x] Clean responsive UI with dark mode

### Bonus (Partial)

- [x] Dark mode toggle
- [x] Excel report export
- [ ] Geofencing
- [ ] Notifications
- [ ] Socket.IO real-time updates
- [ ] PDF export

## Assumptions

1. **Signup creates employees only** — Managers and admins are created by an existing admin via the Users page, or via the seed script.
2. **Selfies stored as base64** in MongoDB for simplicity (no Cloudinary integration in active code path).
3. **Team = all employees** — Managers see all employee attendance; no per-manager team assignment model.
4. **Standard shift is 8 hours** — Fixed constant, not configurable per user.
5. **One open punch session** per employee at a time.
6. **Camera & location** require browser permissions (HTTPS recommended in production).

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

## Important Note

> ⚠️ If MongoDB Atlas connection fails due to DNS/network issues (for example: `querySrv ECONNREFUSED`), you can run the project using a local MongoDB instance.
>
> Local MongoDB connection:
>
> ```env
> MONGO_URL=mongodb://127.0.0.1:27017/attendance-management
> ```
>
> Ensure MongoDB Community Server or MongoDB Compass is installed and running locally before starting the backend.

### 1. Backend

```bash
cd Backend
cp .env.example .env
# Edit .env with your MONGO_URL and JWT_SECRET
npm install
npm run seed    # Creates default admin (admin@attendance.com / admin123)
npm run dev     # http://localhost:5000

**Example .env**

env

PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/attendance
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd Frontend
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

### 3. Default Accounts

After running `npm run seed`:

| Email                | Password | Role  |
| -------------------- | -------- | ----- |
| admin@attendance.com | admin123 | Admin |

Create additional users via Signup (employee) or Admin → Users page (any role).

## API Endpoints

### Auth

- `POST /api/auth/signup` — Register (employee only)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Attendance

- `POST /api/attendance/punch-in` — Employee punch in
- `POST /api/attendance/punch-out` — Employee punch out
- `GET /api/attendance/my-attendance` — Own records
- `GET /api/attendance/team-attendance` — Manager/Admin
- `GET /api/attendance/all-attendance` — Admin only
- `POST /api/attendance/overtime` — Request OT
- `GET /api/attendance/pending-overtime` — Pending OT list
- `POST /api/attendance/:id/overtime` — Approve/reject OT
- `GET /api/attendance/unverified` — Unverified records
- `POST /api/attendance/:id/verify` — Mark valid/invalid
- `GET /api/attendance/report/daily` — Manager/Admin report
- `GET /api/attendance/report/employee` — Employee report

### Users (Admin)

- `GET /api/users` — List users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update role/department

## Deployment

### Backend (Render)

1. Connect GitHub repo, set root to `Backend`
2. Build: `npm install`
3. Start: `npm start`
4. Env vars: `MONGO_URL`, `JWT_SECRET`, `CLIENT_URL` (frontend URL)

### Frontend (Vercel / Netlify)

1. Set root to `Frontend`
2. Build: `npm run build`
3. Output: `dist`
4. Env: `VITE_API_URL=https://your-api.onrender.com/api`

## 🚀 LIVE DEPLOYMENT

### **🔗 BACKEND LIVE URL**

**API BASE URL (TEST USING POSTMAN):**

==> https://attendanceapp-backend1-ptv8.onrender.com

### **🌐 FRONTEND LIVE URL**

**APPLICATION URL:**

==> https://attendance-app-frontend1.vercel.app/

### **⚠️ CURRENT STATUS **

Login and Signup functionality may not work as expected because the deployed backend is currently experiencing a **MongoDB Atlas connection establishment issue**. The frontend deployment is accessible, but authentication-related features are affected until the database connection is restored.

**\*** I AM PHASING THE ISSUE IN MONGO DB ATLAS MY FREE CREDITS IS EXPIRED AND MONGODB SERVER ALSO HAVE SOME ISSUES THAT IS WHY WHEN I LIVE FRONTEND AS WELL THEN I AM PHASING THE ISSUE THAT IS WHY I MENTIONED LOCALHOST PORTS \*\*\*\*

## Scripts

| Command         | Location | Description          |
| --------------- | -------- | -------------------- |
| `npm run dev`   | Both     | Development server   |
| `npm run build` | Frontend | Production build     |
| `npm start`     | Backend  | Production server    |
| `npm run seed`  | Backend  | Create default admin |
