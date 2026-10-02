. (Join-Path $PSScriptRoot 'common.ps1')
$usagePath = Join-Path $GatewayState 'usage.json'
$envPath = Join-Path $GatewayDir '.env'
$requestLimit = 18000
$byteLimit = 900000000
foreach ($line in (Get-Content -LiteralPath $envPath)) {
  if ($line -match '^AI_MONTHLY_REQUEST_LIMIT=(\d+)$') { $requestLimit = [Math]::Min(18000, [int]$Matches[1]) }
  if ($line -match '^AI_MONTHLY_BYTE_LIMIT=(\d+)$') { $byteLimit = [Math]::Min(900000000, [long]$Matches[1]) }
}
while (Get-OwnedProcess 'ngrok') {
  # Read local counters rather than polling an HTTP endpoint and consuming request quota.
  if (Test-Path -LiteralPath $usagePath) {
    try {
      $usage = Get-Content -LiteralPath $usagePath -Raw | ConvertFrom-Json
      if ($usage.month -eq [DateTime]::UtcNow.ToString('yyyy-MM') -and ($usage.requests -ge $requestLimit -or ($usage.receivedBytes + $usage.sentBytes + $usage.reservedBytes) -ge $byteLimit)) {
        $tunnelProcess = Get-OwnedProcess 'ngrok'
        if ($tunnelProcess) { Stop-Process -Id $tunnelProcess.Id }
        Write-Output 'Túnel detenido por el límite gratuito local. Revisa el panel de ngrok; no cambies de plan.'
        break
      }
    } catch { Write-Output 'No fue posible leer las cuotas locales; deteniendo el túnel por precaución.'; $tunnelProcess = Get-OwnedProcess 'ngrok'; if ($tunnelProcess) { Stop-Process -Id $tunnelProcess.Id }; break }
  }
  Start-Sleep -Seconds 10
}
