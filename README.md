# TaskFlow — MERN Project Management App

A full-stack Kanban-style task manager built with MongoDB, Express, React, and Node.js.

## Features
- JWT Authentication (Register / Login)
- Create, manage, and delete Projects
- Kanban board with **drag-and-drop** (To Do / In Progress / Done)
- Task priority (low / medium / high) and due dates
- Overdue task highlighting
- Responsive UI with Tailwind CSS

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, @dnd-kit |
| State | Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |

## Getting Started

### 1. Clone & install

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET

# Frontend
cd ../client
npm install
```

### 2. Set up MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Create a database user
3. Whitelist your IP (or use 0.0.0.0/0 for dev)
4. Copy the connection string into `server/.env` as `MONGO_URI`

### 3. Run locally

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Projects (protected)
| Method | Route | Description |
|---|---|---|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project + tasks |

### Tasks (protected)
| Method | Route | Description |
|---|---|---|
| GET | /api/tasks/project/:id | Get tasks for project |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task / change status |
| DELETE | /api/tasks/:id | Delete task |

## Deployment

**Backend → Render**
1. Push `server/` to GitHub
2. Create a new Web Service on Render
3. Set environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)
4. Build command: `npm install`, Start command: `node index.js`

**Frontend → Vercel**
1. Push `client/` to GitHub
2. Import project in Vercel
3. Set env var: `VITE_API_URL` if you move away from Vite proxy
4. Deploy

## Folder Structure
```
taskflow/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── models/ (User, Project, Task)
│   ├── routes/
│   └── index.js
└── client/
    └── src/
        ├── api/
        ├── components/board/
        ├── context/AuthContext.jsx
        └── pages/
```
