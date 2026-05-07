# Policy Exception Manager

## Summary
Policy Exception Manager is a full-stack workspace for managing policy exception workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Policy Exception Manager addresses a real-world gap in exception governance, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Policy Exception Manager request inbox
- Policy Exception Manager risk cards
- Policy Exception Manager expiry dashboard

## Backend Features
- Policy Exception Manager exception APIs
- Policy Exception Manager renewal workflows
- Policy Exception Manager audit logs

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
