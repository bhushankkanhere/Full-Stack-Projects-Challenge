# AI Prompt Incident Registry

## Summary
AI Prompt Incident Registry is a full-stack workspace for managing ai prompt workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
AI Prompt Incident Registry addresses a real-world gap in model incident tracking, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- AI Prompt Incident Registry incident explorer
- AI Prompt Incident Registry prompt comparison views
- AI Prompt Incident Registry mitigation board

## Backend Features
- AI Prompt Incident Registry incident APIs
- AI Prompt Incident Registry policy endpoints
- AI Prompt Incident Registry remediation workflows

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
