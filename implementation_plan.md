# Advanced Productivity Tracker Implementation Plan

Building a MERN stack application to track and visualize daily productivity.

## User Review Required

> [!IMPORTANT]
> The application will require a MongoDB connection strings. I will use a local MongoDB URI `mongodb://127.0.0.1:27017/productivity-tracker` for the MVP to avoid needing external credentials, but you need to ensure MongoDB is running locally. Let me know if you prefer using a cloud MongoDB Atlas URI instead.

## Proposed Changes

### Backend Structure

Files to be created in the `backend/` directory:

#### [NEW] `backend/server.js`
Main Express server setup, middleware, and route mounting.

#### [NEW] `backend/config/db.js`
MongoDB connection using Mongoose.

#### [NEW] `backend/models/User.js`
Mongoose schema for User (_id, name, email, password).

#### [NEW] `backend/models/Task.js`
Mongoose schema for Task (_id, userId, title, date, completed, createdAt).

#### [NEW] `backend/middleware/authMiddleware.js`
JWT verification middleware.

#### [NEW] `backend/routes/authRoutes.js`
Routes for `POST /api/auth/signup` and `POST /api/auth/login`. Required password hashing using `bcryptjs`.

#### [NEW] `backend/routes/taskRoutes.js`
Routes for GET, POST, PUT, DELETE operations on `/api/tasks`. Will filter by authenticated user.

#### [NEW] `backend/routes/productivityRoutes.js`
Routes to compute daily, weekly, and monthly productivity stats by aggregating task data.

---

### Frontend Structure

Files to be created in the `frontend/` directory:

#### [NEW] `frontend/src/context/AuthContext.jsx`
React context to manage the current user state and token.

#### [NEW] `frontend/src/utils/api.js`
Axios instance configured with the base backend URL and automatic JWT injection in headers.

#### [NEW] `frontend/src/App.jsx`
Main layout, routing setup (React Router), and protected routes.

#### [NEW] `frontend/src/pages/Login.jsx` & `frontend/src/pages/Signup.jsx`
Authentication pages.

#### [NEW] `frontend/src/pages/Dashboard.jsx`
The main view containing the components below.

#### [NEW] `frontend/src/components/layout/Sidebar.jsx`
Navigation menu indicating Dashboard, Tasks, Analytics.

#### [NEW] `frontend/src/components/dashboard/StatsHeader.jsx`
Greeting, today's productivity percentage, total and completed tasks today.

#### [NEW] `frontend/src/components/tasks/TaskManager.jsx`
List of today's tasks with interactions to add, edit, delete, and check off tasks.

#### [NEW] `frontend/src/components/dashboard/ChartsSection.jsx`
Recharts implementation for Daily (LineChart), Weekly (BarChart), and Monthly (BarChart) productivity.

#### [NEW] `frontend/src/components/dashboard/AiInsights.jsx`
Placeholder component for future AI features.

## Verification Plan

### Automated Tests
- Build and run the React app to ensure there are no compilation errors (`npm run dev`).
- Run the Express backend and verify connection to MongoDB (`npm run server`).

### Manual Verification
- Verify that a user can sign up and log in.
- Verify creating, updating, completing, and deleting a task updates the UI and backend database.
- Verify that the dashboard stats and Recharts automatically update based on the created/completed tasks.
- Verify the layout looks complete, modern, and aesthetically pleasing using Tailwind CSS.
