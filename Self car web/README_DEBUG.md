# Debugging Quick Start

This project includes a Java Spring Boot backend and a Vite/React frontend.
The repo now ships with workspace-level editor and debug settings to make local debugging fast and consistent.

## Prereqs
- Node.js LTS and npm
- Java 17+ and Maven
- VS Code with Java extensions (Extension Pack for Java)

## Run from VS Code (recommended)
- Press F5 and select one of:
  - "Frontend: Vite dev server"
  - "Backend: Spring Boot (SelfCarApplication)"
  - "Start Frontend + Backend" (compound)

Tasks are available in Terminal -> Run Task:
- frontend: install | dev | build
- backend: build (skip tests) | run
- project: start both

## Run from terminal
```bash
# From repo root
# Frontend
cd frontend
npm ci
npm run dev

# Backend
cd ../backend
mvn spring-boot:run
```

## Tips for easier debugging
- Ensure `SPRING_PROFILES_ACTIVE=dev` is used for the backend (configured in the VS Code launcher).
- Use the compound launcher to start both services together; set breakpoints in either side.
- If ports clash, update `vite.config.js` and `application.properties` dev ports to avoid collisions.
- Prefer `npm ci` over `npm install` for reproducible installs.

## Next suggestions (optional)
- Add request/trace IDs to logs (Spring Sleuth/Micrometer) and correlate frontend requests.
- Enable structured JSON logs in backend for easier parsing in aggregators.
- Add a `.env.example` and load from `vite` + Spring `application-dev.properties`.

