# Product Recall Response Center

## Summary
Product Recall Response Center is a full-stack workspace for managing product recall workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Product Recall Response Center addresses a real-world gap in trace and response, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Product Recall Response Center response dashboard
- Product Recall Response Center batch explorer
- Product Recall Response Center partner status board

## Backend Features
- Product Recall Response Center lot APIs
- Product Recall Response Center workflow endpoints
- Product Recall Response Center response metrics

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
