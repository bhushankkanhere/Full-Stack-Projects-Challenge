# Smart Itinerary Builder

## Category
Travel Planning

## Summary
Smart Itinerary Builder is a full-stack starter project for travel planning teams that need a clean dashboard, live API data, and a small workflow system they can extend in VS Code.

## Run In VS Code
1. Open this project folder in Visual Studio Code.
2. Run `npm install` in the project root. If PowerShell blocks `npm`, use `npm.cmd install`.
3. Run `npm run install:all` in the project root. If needed in PowerShell, use `npm.cmd run install:all`.
4. Run `npm run dev` in the project root. If needed in PowerShell, use `npm.cmd run dev`.
5. Open `http://localhost:4173` in the browser.

## Project Structure
- `frontend` for the user interface
- `backend` for the Express API

## API Endpoints
- `GET /api/health`
- `GET /api/overview`
- `GET /api/work-items`
- `GET /api/metrics`
- `POST /api/work-items`

## Notes
- Run one project at a time because the starter projects share the same local ports.
- Each project in `All Projects List` has a different category and a unique idea.
