# NEXUS OS MVP - TODO

## Step 1: Create Next.js + Tailwind frontend
- [x] Scaffold Next.js App Router (TypeScript) into `frontend/`
- [x] Configure Tailwind dark neon theme defaults

## Step 2: Build Dashboard UI
- [x] Implement `frontend/app/layout.tsx` (sidebar + top stats bar, dark futuristic styling)
- [x] Implement `frontend/app/page.tsx` (dashboard content shell)

## Step 3: Build Scan Target component
- [x] Create Scan Target component with URL input
- [x] Simulate scan progress + terminal-like output in UI
- [x] POST to backend `POST /api/scan` and render returned dummy vulnerabilities

## Step 4: Build Express API route
- [x] Create `backend/routes/scanRoutes.js`
- [x] Mount route in `backend/server.js` at `POST /api/scan`
- [x] Return dummy vulnerability data JSON

## Step 5: MVP wiring + run
- [x] Add `NEXT_PUBLIC_API_BASE_URL` usage in frontend
- [ ] Start backend and frontend and verify scan flow

