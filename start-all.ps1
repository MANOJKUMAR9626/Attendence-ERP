Write-Host "Starting SmartERP Services..." -ForegroundColor Green

# 1. Start Backend Server (Node.js)
Write-Host "Starting Node.js Backend on port 5000..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory ".\server"

# 3. Start Frontend Client (Vite)
Write-Host "Starting React Frontend on port 5173..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory ".\client"

Write-Host "All services started! Check the newly opened terminal windows." -ForegroundColor Green
