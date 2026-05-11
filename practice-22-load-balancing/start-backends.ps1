# PowerShell-скрипт: запускает три экземпляра cars-backend на портах 3001, 3002, 3003
# Каждый — в отдельном окне PowerShell
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $here 'backend'

foreach ($p in 3001, 3002, 3003) {
    $cmd = "cd `"$backend`"; `$env:PORT=$p; `$env:SERVER_ID='cars-$p'; node server.js"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
}
Write-Host "Запущены три бэкенда на портах 3001, 3002, 3003"
