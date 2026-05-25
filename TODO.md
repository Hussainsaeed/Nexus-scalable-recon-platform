# TODO - NEXUS OS initial codebase

- [ ] Generate requested project ASCII tree
- [ ] Update `frontend/src/app/layout.tsx` with dark futuristic shell, sidebar nav, and glowing header text `SYSTEMS: OPERATIONAL`
- [ ] Create `frontend/src/app/page.tsx` dashboard page with stats bar + Scan Target + terminal logger
- [ ] Create `frontend/src/components/ScanTarget.tsx` neon URL input + START SCAN button + progress bar + terminal log simulation; call backend `/api/scan`
- [ ] Create TypeScript-first backend entrypoint `backend/server.ts`
- [ ] Configure backend TS tooling in `backend/package.json` (ts-node/tsx) and dependencies/types
- [ ] Wire `/api/scan` POST to accept `{ url: string }`, simulate 2s delay, return dummy vulnerability JSON including riskScore
- [ ] Ensure frontend build passes (`cd frontend && npm run build`)

