$ErrorActionPreference = 'Stop'
$StudyroomRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$GatewayDir = Join-Path $StudyroomRoot 'apps/ai-gateway'
$GatewayState = Join-Path $GatewayDir '.local'
New-Item -ItemType Directory -Path $GatewayState -Force | Out-Null

function Set-PrivateFile([string]$Path) {
  if ($env:OS -eq 'Windows_NT') {
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $acl = New-Object System.Security.AccessControl.FileSecurity
    $acl.SetAccessRuleProtection($true, $false)
    $acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', 'Allow')))
    Set-Acl -LiteralPath $Path -AclObject $acl
  }
}

function Get-OwnedProcess([string]$Name) {
  $recordPath = Join-Path $GatewayState ($Name + '-process.json')
  if (!(Test-Path -LiteralPath $recordPath)) { return $null }
  $record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
  $running = Get-Process -Id $record.id -ErrorAction SilentlyContinue
  if ($running -and $running.Path -eq $record.path -and $running.StartTime.ToUniversalTime().Ticks -eq ([DateTime]$record.startedAt).ToUniversalTime().Ticks) { return $running }
  return $null
}

function Save-OwnedProcess([string]$Name, $Process) {
  # Windows can return a Process before its executable metadata is available.
  # Never write a path:null ownership record that cannot be checked on restart.
  $verifiedProcess = $null
  for ($attempt = 0; $attempt -lt 10; $attempt++) {
    $verifiedProcess = Get-Process -Id $Process.Id -ErrorAction SilentlyContinue
    if ($verifiedProcess -and $verifiedProcess.Path) { break }
    Start-Sleep -Milliseconds 100
  }
  if (!$verifiedProcess -or !$verifiedProcess.Path) { throw ('No se puede verificar la identidad del proceso ' + $Name + '. No se registrará un proceso sin ruta.') }
  @{ id = $verifiedProcess.Id; name = $Name; startedAt = $verifiedProcess.StartTime.ToUniversalTime().ToString('o'); path = $verifiedProcess.Path } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $GatewayState ($Name + '-process.json'))
}

function Find-Ollama {
  $command = Get-Command ollama.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $candidate = Join-Path $env:LOCALAPPDATA 'Programs/Ollama/ollama.exe'
  if (Test-Path -LiteralPath $candidate) { return $candidate }
  throw 'Instala Ollama desde https://ollama.com/download/windows y vuelve a ejecutar este script.'
}

function Find-Ngrok {
  $command = Get-Command ngrok.exe -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $candidate = Join-Path $GatewayState 'bin/ngrok.exe'
  if (Test-Path -LiteralPath $candidate) { return $candidate }
  throw 'Instala ngrok con: winget install ngrok -s msstore'
}

function Read-GatewaySecret {
  $envPath = Join-Path $GatewayDir '.env'
  if (!(Test-Path -LiteralPath $envPath)) { throw 'Primero ejecuta scripts/local-ai/setup.ps1.' }
  $secretLine = Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^AI_GATEWAY_SECRET=' } | Select-Object -First 1
  if (!$secretLine) { throw 'Falta AI_GATEWAY_SECRET. Ejecuta setup.ps1.' }
  return $secretLine.Substring('AI_GATEWAY_SECRET='.Length).Trim()
}
