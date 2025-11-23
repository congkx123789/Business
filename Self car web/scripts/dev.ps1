param(
  [switch]$NoFrontend
)

Write-Host "🚀 Dev: starting backend (Spring Boot) and frontend (Vite)" -ForegroundColor Cyan

# Start backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run -Dspring-boot.run.profiles=dev"
Start-Sleep -Seconds 3

if (-not $NoFrontend) {
  # Start frontend
  Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
}

Write-Host "📍 Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Green


