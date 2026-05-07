# Renewable Asset Maintenance Ops

## Summary
Renewable Asset Maintenance Ops is a full-stack workspace for managing renewable asset workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Renewable Asset Maintenance Ops addresses a real-world gap in asset operations, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Renewable Asset Maintenance Ops asset map
- Renewable Asset Maintenance Ops maintenance board
- Renewable Asset Maintenance Ops health summaries

## Backend Features
- Renewable Asset Maintenance Ops asset APIs
- Renewable Asset Maintenance Ops work-order workflows
- Renewable Asset Maintenance Ops alert endpoints

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
