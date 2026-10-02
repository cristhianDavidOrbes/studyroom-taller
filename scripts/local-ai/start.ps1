param([switch]$Tunnel, [switch]$PullModel)
. (Join-Path $PSScriptRoot 'common.ps1')
if (!(Test-Path -LiteralPath (Join-Path $GatewayDir '.env'))) { & (Join-Path $PSScriptRoot 'setup.ps1') }
$ollamaPath = Find-Ollama

if (!(Get-OwnedProcess 'ollama')) {
  $listener = Get-NetTCPConnection -LocalPort 11434 -State Listen -ErrorAction SilentlyContinue
  if ($listener) { throw 'Ollama ya está activo fuera de StudyRoom. Ciérralo desde su icono y vuelve a iniciar para aplicar el modo sin cloud y los límites de recursos.' }
  $env:OLLAMA_HOST = '127.0.0.1:11434'
  $env:OLLAMA_NO_CLOUD = '1'
  $env:OLLAMA_DEBUG = 'false'
  $env:OLLAMA_NUM_PARALLEL = '1'
  $env:OLLAMA_MAX_LOADED_MODELS = '1'
  $env:OLLAMA_CONTEXT_LENGTH = '4096'
  $env:OLLAMA_MAX_QUEUE = '4'
  $env:OLLAMA_KEEP_ALIVE = '60s'
  $ollamaProcess = Start-Process -FilePath $ollamaPath -ArgumentList 'serve' -WindowStyle Hidden -RedirectStandardOutput (Join-Path $GatewayState 'ollama.stdout.log') -RedirectStandardError (Join-Path $GatewayState 'ollama.stderr.log') -PassThru
  Save-OwnedProcess 'ollama' $ollamaProcess
}

$ollamaReady = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
  try { $tags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2; $ollamaReady = $true; break } catch { Start-Sleep -Seconds 1 }
}
if (!$ollamaReady) { throw 'Ollama no inició. Revisa apps/ai-gateway/.local/ollama.stderr.log.' }
if ($PullModel -or !($tags.models | Where-Object name -eq 'qwen3:4b-instruct')) {
  Write-Output 'Descargando qwen3:4b-instruct local (aproximadamente 2,5 GB).'
  & $ollamaPath pull qwen3:4b-instruct
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo completar la descarga del modelo.' }
}

& (Join-Path $PSScriptRoot 'start-speech.ps1')
if (!(Test-Path -LiteralPath (Join-Path $GatewayState 'ocr-data/spa.traineddata')) -or !(Test-Path -LiteralPath (Join-Path $GatewayState 'ocr-data/eng.traineddata'))) {
  try { & (Join-Path $PSScriptRoot 'setup-ocr.ps1') }
  catch { Write-Output 'El lector de imágenes no está preparado. La IA de texto puede continuar; vuelve a ejecutar setup-ocr.ps1.' }
}

if (!(Test-Path -LiteralPath (Join-Path $GatewayDir 'dist/index.js'))) {
  Push-Location $StudyroomRoot
  try { & npm.cmd run build -w '@studyroom/ai-gateway'; if ($LASTEXITCODE -ne 0) { throw 'Compila primero las dependencias con npm ci.' } } finally { Pop-Location }
}
if (!(Get-OwnedProcess 'gateway')) {
  $listener = Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
  if ($listener) { throw 'El puerto 8787 está ocupado por otro proceso. No se modificará.' }
  $nodePath = (Get-Command node.exe).Source
  $gatewayProcess = Start-Process -FilePath $nodePath -ArgumentList '--env-file=.env', 'dist/index.js' -WorkingDirectory $GatewayDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $GatewayState 'gateway.stdout.log') -RedirectStandardError (Join-Path $GatewayState 'gateway.stderr.log') -PassThru
  Save-OwnedProcess 'gateway' $gatewayProcess
}

$gatewayReady = $false
for ($attempt = 0; $attempt -lt 15; $attempt++) {
  try { $null = Invoke-RestMethod -Uri 'http://127.0.0.1:8787/health' -TimeoutSec 2; $gatewayReady = $true; break } catch { Start-Sleep -Seconds 1 }
}
if (!$gatewayReady) { throw 'La puerta local no inició. Revisa apps/ai-gateway/.local/gateway.stderr.log.' }

if ($Tunnel) {
  $ngrokPath = Find-Ngrok
  $ngrokConfig = Join-Path $GatewayState 'ngrok.yml'
  $existingConfig = Join-Path $env:LOCALAPPDATA 'ngrok/ngrok.yml'
  if (!(Test-Path -LiteralPath $ngrokConfig) -and (Test-Path -LiteralPath $existingConfig)) {
    $existing = Get-Content -LiteralPath $existingConfig -Raw
    if ($existing -match 'authtoken:\s*([A-Za-z0-9_\-]{20,200})') {
      $privateConfig = "version: `"3`"`nagent:`n  authtoken: $($Matches[1])`n  web_addr: 127.0.0.1:4040`n"
      [System.IO.File]::WriteAllText($ngrokConfig, $privateConfig)
      Set-PrivateFile $ngrokConfig
      $privateConfig = $null
    }
    $existing = $null
  }
  if (!(Test-Path -LiteralPath $ngrokConfig)) { throw 'Falta la cuenta de ngrok. Ejecuta setup.ps1 -ConfigureNgrok y luego start.ps1 -Tunnel.' }
  if (!(Get-OwnedProcess 'ngrok')) {
    $argsForNgrok = @('http', 'http://127.0.0.1:8787', '--inspect=false', '--log=stdout', '--log-format=json', ('--config="' + $ngrokConfig + '"'))
    $tunnelProcess = Start-Process -FilePath $ngrokPath -ArgumentList $argsForNgrok -WindowStyle Hidden -RedirectStandardOutput (Join-Path $GatewayState 'ngrok.stdout.log') -RedirectStandardError (Join-Path $GatewayState 'ngrok.stderr.log') -PassThru
    Save-OwnedProcess 'ngrok' $tunnelProcess
  }
  $publicUrl = $null
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try {
      $tunnels = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -TimeoutSec 2
      $publicUrl = ($tunnels.tunnels | Where-Object { $_.proto -eq 'https' -and $_.config.addr -eq 'http://127.0.0.1:8787' } | Select-Object -First 1).public_url
      if ($publicUrl) { break }
    } catch { }
    Start-Sleep -Seconds 1
  }
  if (!$publicUrl) { throw 'ngrok no conectó. Revisa la cuenta/authtoken y los logs locales.' }
  @{ AI_GATEWAY_URL = $publicUrl; observedAt = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $GatewayState 'public-url.json')
  Write-Output ('URL de IA para el backend de Render: ' + $publicUrl)
  if (!(Get-OwnedProcess 'watchdog')) {
    $shellPath = (Get-Process -Id $PID).Path
    $watchdogProcess = Start-Process -FilePath $shellPath -ArgumentList '-NoProfile', '-File', ('"' + (Join-Path $PSScriptRoot 'watchdog.ps1') + '"') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $GatewayState 'watchdog.stdout.log') -RedirectStandardError (Join-Path $GatewayState 'watchdog.stderr.log') -PassThru
    Save-OwnedProcess 'watchdog' $watchdogProcess
  }
}
Write-Output 'IA local activa en 127.0.0.1:8787; Ollama permanece en 127.0.0.1:11434. Usa check.ps1 para verificar.'
