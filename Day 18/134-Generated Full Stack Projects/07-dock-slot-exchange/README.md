# Dock Slot Exchange

## Summary
Dock Slot Exchange is a full-stack workspace for managing dock slot workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Dock Slot Exchange addresses a real-world gap in operational routing, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Dock Slot Exchange schedule board
- Dock Slot Exchange status cards
- Dock Slot Exchange exception queue

## Backend Features
- Dock Slot Exchange routing APIs
- Dock Slot Exchange capacity checks
- Dock Slot Exchange operations metrics

## Tech Stack
- HTML
- CSS
- JavaScript
- Node.js
- Express
- PostgreSQL-ready schema

## Difficulty
Medium-Hard

## Run Locally
1. In `backend`, run `npm install` and then `npm run dev`.
2. In `frontend`, run `npm install` and then `npm run dev`.
3. Open the frontend URL shown by `serve`.

## API Endpoints
- `GET /api/health`
- `GET /api/overview`
- `GET /api/work-items`
- `GET /api/metrics`
- `POST /api/work-items`
