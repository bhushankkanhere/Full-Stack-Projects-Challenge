# Tenant Maintenance SLA Hub

## Summary
Tenant Maintenance SLA Hub is a full-stack workspace for managing tenant maintenance workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Tenant Maintenance SLA Hub addresses a real-world gap in property operations, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Tenant Maintenance SLA Hub tenant portal
- Tenant Maintenance SLA Hub timeline views
- Tenant Maintenance SLA Hub vendor board

## Backend Features
- Tenant Maintenance SLA Hub ticket APIs
- Tenant Maintenance SLA Hub dispatch workflows
- Tenant Maintenance SLA Hub SLA summaries

## Tech Stack
- HTML
- CSS
- JavaScript
- Node.js
- Express
- PostgreSQL-ready schema

## Difficulty
Medium

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
