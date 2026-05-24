# Bug Forge

Bug Forge is a backend API for software teams to track bugs and feature requests. Built with Node.js, TypeScript, and PostgreSQL.

**Live URL:** 

---

## What it does

- Teams can sign up as contributor or maintainer
- Contributors can create and view issues
- Maintainers can update, delete, and change issue status
- JWT used for authentication, bcrypt for password security
- All database queries written in raw SQL — no ORM

---

## Tech Stack

Node.js · TypeScript · Express.js · PostgreSQL · bcrypt · jsonwebtoken

---

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/hasan-soft/bug-forge.git
cd bug-forge
npm install
```

Create a `.env` file in the root:
```
PORT=8000
DATABASE_URL=postgresql://username:password@hostname/dbname?sslmode=require
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

Start the server:

```bash
npm run dev
```

Tables are created automatically on first run.

---

## User Roles

**contributor**
- Register and login
- Create issues
- View all issues
- Update own issues (only if status is open)

**maintainer**
- All contributor permissions
- Update any issue
- Delete any issue
- Change issue status

---

## Authentication

JWT-based authentication is used. After login, send the token in the request header:
Authorization: <JWT_TOKEN>

---

## API Endpoints

### Auth

**POST /api/auth/signup**
```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**POST /api/auth/login**
```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

### Issues

**GET /api/issues** — Public

Query params: `?sort=newest&type=bug&status=open`

| Param | Values |
|---|---|
| sort | newest, oldest |
| type | bug, feature_request |
| status | open, in_progress, resolved |

**GET /api/issues/:id** — Public

**POST /api/issues** — Auth required
```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries",
  "type": "bug"
}
```

**PATCH /api/issues/:id** — Auth required
```json
{
  "title": "Updated issue title",
  "description": "Updated issue description",
  "type": "bug"
}
```

**DELETE /api/issues/:id** — Maintainer only

---

## Database Schema

**users**

| Field | Type |
|---|---|
| id | SERIAL PRIMARY KEY |
| name | VARCHAR(255) |
| email | VARCHAR(255) UNIQUE |
| password | VARCHAR(255) |
| role | VARCHAR(20) |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

**issues**

| Field | Type |
|---|---|
| id | SERIAL PRIMARY KEY |
| title | VARCHAR(150) |
| description | TEXT |
| type | VARCHAR(20) |
| status | VARCHAR(20) |
| reporter_id | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

## Response Structure

**Success**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": {}
}
```
