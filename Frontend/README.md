# Frontend

Frontend is built using React + Vite and follows a feature-based architecture with Redux Toolkit and RTK Query.

## Frontend Features

- JWT Authentication
- Protected Routes
- Role Based UI Rendering
- Attendance Punch In / Punch Out
- Camera Selfie Capture
- Geolocation Tracking
- Attendance Reports
- Excel Export
- Overtime Requests
- User Management (Admin)
- Attendance Validation
- Dark Mode Support
- Responsive Design

## Frontend Environment Variables

Create a `.env` file inside the Frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://your-backend-url/api
```

## Frontend Build

```bash
npm run build
```

Build files will be generated inside:

```bash
dist/
```

## Frontend Development

```bash
npm run dev
```

Application will run on:

```bash
http://localhost:5173
```

## MongoDB Atlas Note

⚠️ MongoDB Atlas DNS resolution issues may occur on some networks or ISPs.

If Atlas connection fails with errors such as:

```bash
querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net
```

You can temporarily use a local MongoDB instance through MongoDB Compass.

Example:

```env
MONGO_URL=mongodb://127.0.0.1:27017/attendance
```

This issue is related to Atlas DNS/network resolution and not the application code.
