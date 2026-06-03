Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "     CRM Application Launcher" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend
Write-Host "[1/2] Starting Backend (port 5000)..." -ForegroundColor Yellow
$backendJob = Start-Process -NoNewWindow -PassThru -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$rootDir\backend"
Start-Sleep -Seconds 2

# Start frontend
Write-Host "[2/2] Starting Frontend (port 3000)..." -ForegroundColor Yellow
$frontendJob = Start-Process -NoNewWindow -PassThru -FilePath "npx" -ArgumentList "vite" -WorkingDirectory "$rootDir\frontend"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  CRM is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop both servers..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backendJob.Id -Force
Stop-Process -Id $frontendJob.Id -Force
Write-Host "Servers stopped." -ForegroundColor Red
