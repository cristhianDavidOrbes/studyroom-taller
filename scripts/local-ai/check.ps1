. (Join-Path $PSScriptRoot 'common.ps1')
$secretValue = Read-GatewaySecret
try {
  $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8787/v1/health' -Headers @{ Authorization = "Bearer $secretValue" } -TimeoutSec 5
  $health | ConvertTo-Json -Depth 5
  try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:8787/v1/health' -TimeoutSec 5; throw 'La ruta privada aceptó una solicitud sin credencial.' }
  catch { if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }; Write-Output 'Verificado: la ruta privada rechaza solicitudes sin credencial (401).' }
} finally { $secretValue = $null }
Get-NetTCPConnection -LocalPort 11434, 8787 -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort
$gpuCommand = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if ($gpuCommand) { & $gpuCommand.Source --query-gpu=name,memory.total,memory.used,utilization.gpu --format=csv,noheader }
Write-Output 'Compara las cuotas aproximadas con el panel de ngrok; otros túneles o tráfico bloqueado por ngrok no aparecen en este registro.'
