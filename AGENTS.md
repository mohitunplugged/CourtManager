# Repository Guidelines

## Project Structure & Module Organization
The active app lives under `CourtManagerPro/`.
- `CourtManagerPro/client/` is a Vite + React frontend. Source is in `CourtManagerPro/client/src/`, static assets in `CourtManagerPro/client/public/`.
- `CourtManagerPro/server/` is an Express + Socket.IO API with SQLite. Entry point is `CourtManagerPro/server/index.js`, database helpers in `CourtManagerPro/server/db.js`, and the SQLite file is `CourtManagerPro/server/courtmanager.db`.
- `CourtManagerPro/dist/` is the generated static build output (created by the Vercel build).
At the repo root, `CourtManager.html` and `CourtManager2.html` are standalone static pages.

## Build, Test, and Development Commands
Run commands from the listed directory:
- `CourtManagerPro/client`: `npm run dev` (Vite dev server), `npm run build` (builds to `CourtManagerPro/dist`), `npm run lint`, `npm run preview`.
- `CourtManagerPro/server`: `node index.js` (starts the API/socket server on port 3000). `npm test` is a placeholder and currently exits with an error.
- `CourtManagerPro`: `npm run vercel-build` (installs server/client deps and builds the client for Vercel).

## Coding Style & Naming Conventions
- Client uses ESM and JSX; server uses CommonJS (`require`/`module.exports`).
- Use 2-space indentation and keep JSX readable.
- React components are `PascalCase` (see `CourtManagerPro/client/src/components/`), hooks use `use*`.
- Linting is handled by ESLint (`CourtManagerPro/client/eslint.config.js`); run `npm run lint` before sharing changes.

## Testing Guidelines
There are no automated tests yet. Validate changes by running the server and client together and exercising key flows. If you add tests, follow standard React/Vite conventions such as `Component.test.jsx` placed near the component or in a `__tests__` folder.

## Commit & Pull Request Guidelines
No Git history is available in this workspace, so keep commit messages short and imperative (e.g., "Add socket event for check-in"). PRs should include a brief summary, test notes (commands run or "not run"), and screenshots or GIFs for UI changes.

## Security & Configuration Tips
The server uses SQLite and may use environment variables via `dotenv`. Do not commit secrets; add new config to `.env` and document expected keys in a short note or `.env.example`.
