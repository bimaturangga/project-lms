# Restart Next.js Development Server
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Restarting Next.js Dev Server..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Kill all node processes
Write-Host "`n[1/4] Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove lock file
Write-Host "[2/4] Removing lock file..." -ForegroundColor Yellow
Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next\dev" -Recurse -Force -ErrorAction SilentlyContinue

# Clean up ports
Write-Host "[3/4] Cleaning up ports..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $processId = $port3000.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Start dev server
Write-Host "[4/4] Starting dev server..." -ForegroundColor Yellow
Write-Host "`n======================================" -ForegroundColor Green
Write-Host "Server is starting..." -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Green

npm run dev
