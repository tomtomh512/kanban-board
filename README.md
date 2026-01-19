# NestJS & React Kanban Board

A NestJS backend with React frontend for real-time collaborative project management, featuring JWT authentication, WebSocket updates, and kanban-style task boards

<img src="assets/thumbnail.png">

---

## Features

- Real-time Collaboration – Live updates across all connected users via WebSockets
- Project Management – Create and manage multiple projects with team members
- Team Collaboration – Invite team members to projects and assign tasks
- Authentication – Secure user accounts with JWT-based authentication

---

## Technologies & Implementation

- Frontend - TypeScript React
- Backend - NestJS
- Database - PostgreSQL

---

## Local Development
1. Ensure Docker and Docker Compose are installed on your system
2. From the project root directory, start all services:
```
docker-compose up --build
```
3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432