# Vendor Security Assessment Portal

## Summary
Vendor Security Assessment Portal is a full-stack workspace for managing vendor security workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Vendor Security Assessment Portal addresses a real-world gap in security operations, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Vendor Security Assessment Portal control dashboard
- Vendor Security Assessment Portal issue board
- Vendor Security Assessment Portal evidence review views

## Backend Features
- Vendor Security Assessment Portal security APIs
- Vendor Security Assessment Portal risk endpoints
- Vendor Security Assessment Portal audit summaries

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
