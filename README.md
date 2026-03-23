
---

# Retail Scheduling App — Backend API

Node/Express API for a retail scheduling system with role-based access control.  
Handles authentication, schedule weeks, shifts, request workflows (time off + swaps), and shift conflict detection.

---

## Live FrontEnd Demo

🔗 [Schedule](https://schedule-fe-jmpv.onrender.com)

---

## Tech Stack
- Node.js + Express
- PostgreSQL
- Knex (migrations + seeds)
- JWT Authentication
- bcryptjs

---

## Core Tables
- `stores`
- `departments`
- `roles`
- `users`
- `user_assignments`
- `schedule_weeks`
- `shifts`
- `time_off_requests`
- `shift_swap_requests`

Highlights:
- `schedule_weeks` controls week status (**published/draft/locked**) + hour budget
- `user_assignments` defines active store/department/role (active row = `end_date IS NULL`)
- `shifts` uses Option A: **one shift = one associate** (no multi-assignment)

---

## Authentication

### Login
`POST /api/auth/login`

Returns:
- `token` (JWT)
- `user` (includes `store_id` + `role_code`)

JWT payload includes:
- `sub` (user id)
- `email`
- `store_id`
- `role_code`

### Current User
`GET /api/auth/me`  
Requires:
`Authorization: Bearer <token>`

---

## Roles / Access Rules

- **ASSOCIATE**
  - Can view only their own schedule and requests
  - Cannot create/update/delete store shifts
  - Conflicts endpoint returns only their conflicts

- **MANAGER roles**: ADMIN / HR / COACH / TEAM_LEAD
  - Can view store-wide schedule + roster
  - Can create/update/delete shifts (within business rules)
  - Can view store-wide pending requests and conflicts

---

## API Endpoints

### Requests
- `GET /api/requests/summary?store_id=...` (manager)
- `GET /api/requests/summary` (associate)

### Time Off
- `GET /api/time-off?store_id=...&status=pending|approved|denied` (manager)
- `GET /api/time-off?status=pending|approved|denied` (associate)

### Swaps
- `GET /api/swaps?store_id=...&status=pending|approved|denied|canceled` (manager)
- `GET /api/swaps?status=pending|approved|denied|canceled` (associate)

### Shifts
- `GET /api/shifts?store_id=...&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&department_id?`
- `POST /api/shifts`
- `PATCH /api/shifts/:shiftId`
- `DELETE /api/shifts/:shiftId`

Conflicts:
- `GET /api/shifts/conflicts?store_id=...&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

### Schedule Weeks
- `GET /api/schedule-weeks?store_id=...`
- Week enforcement job ensures:
  - current + next 2 weeks = **published**
  - week 3 ahead = **draft**
  - locked weeks cannot be edited

---

## Run Locally

### 1) Install
```bash
npm install


## Demo Accounts (Seeded)

Use these accounts after running:

```bash
npx knex seed:run

**HR**
- Email: `hr1@company.com`
- Password: `Password123!`

**Team Lead**
- Email: `lead1@company.com`
- Password: `Password123!`

**Associate**
- Email: `associate1@company.com`
- Password: `Password123!`
