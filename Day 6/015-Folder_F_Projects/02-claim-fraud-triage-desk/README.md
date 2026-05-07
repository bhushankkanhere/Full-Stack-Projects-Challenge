# Claim Fraud Triage Desk

## Summary
Claim Fraud Triage Desk is a full-stack workspace for managing claim fraud workflows with live dashboards, seeded operational records, and room to extend into production features.

## Problem
Claim Fraud Triage Desk addresses a real-world gap in claim review, where teams still rely on spreadsheets, email, or delayed follow-up.

## Frontend Features
- Claim Fraud Triage Desk risk queue
- Claim Fraud Triage Desk evidence timeline
- Claim Fraud Triage Desk investigator workload board

## Backend Features
- Claim Fraud Triage Desk scoring-ready claim APIs
- Claim Fraud Triage Desk evidence endpoints
- Claim Fraud Triage Desk audit logs

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
