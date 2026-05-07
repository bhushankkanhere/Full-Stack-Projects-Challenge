# DSAR Request Desk

## Summary
DSAR Request Desk is a full-stack workspace for managing dsar request workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
DSAR Request Desk addresses a real-world gap in privacy operations, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- DSAR Request Desk request dashboard
- DSAR Request Desk status timeline
- DSAR Request Desk legal queue

## Backend Features
- DSAR Request Desk request APIs
- DSAR Request Desk deadline workflows
- DSAR Request Desk audit endpoints

## Tech Stack
- HTML
- CSS
- JavaScript
- Node.js
- Express
- PostgreSQL-ready schema

## Difficulty
Hard

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
