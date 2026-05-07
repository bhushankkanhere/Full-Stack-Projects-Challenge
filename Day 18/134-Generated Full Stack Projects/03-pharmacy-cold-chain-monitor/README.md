# Pharmacy Cold-Chain Monitor

## Summary
Pharmacy Cold-Chain Monitor is a full-stack workspace for managing pharmacy cold workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Pharmacy Cold-Chain Monitor addresses a real-world gap in shipment telemetry, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Pharmacy ColdChain Monitor monitoring dashboard
- Pharmacy ColdChain Monitor alert timeline
- Pharmacy ColdChain Monitor device health cards

## Backend Features
- Pharmacy ColdChain Monitor telemetry APIs
- Pharmacy ColdChain Monitor alert rules
- Pharmacy ColdChain Monitor shipment summaries

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
