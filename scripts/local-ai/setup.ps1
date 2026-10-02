param([switch]$ConfigureNgrok)
. (Join-Path $PSScriptRoot 'common.ps1')

$envPath = Join-Path $GatewayDir '.env'
if (!(Test-Path -LiteralPath $envPath)) {
  $randomBytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
  $secretValue = -join ($randomBytes | ForEach-Object { $_.ToString('x2') })
  $contents = (Get-Content -LiteralPath (Join-Path $GatewayDir '.env.example') -Raw).Replace('replace_with_a_random_64_character_secret', $secretValue)
  [System.IO.File]::WriteAllText($envPath, $contents)
  Set-PrivateFile $envPath
  $secretValue = $null
  $contents = $null
  Write-Output 'Credencial local generada y protegida. El valor no se muestra.'
} else {
  Set-PrivateFile $envPath
  Write-Output 'Se conserva la credencial local existente.'
}

if ($ConfigureNgrok) {
  $ngrokPath = Find-Ngrok
  Write-Output 'Obtén tu authtoken gratuito en https://dashboard.ngrok.com/get-started/your-authtoken. No lo pegues en el chat.'
  $secureToken = Read-Host 'Pega aquí el authtoken de ngrok (entrada oculta)' -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
  try {
    $tokenValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    if ($tokenValue -notmatch '^[A-Za-z0-9_\-]{20,200}$') { throw 'Formato de authtoken no válido.' }
    $ngrokConfig = Join-Path $GatewayState 'ngrok.yml'
    $yaml = "version: `"3`"`nagent:`n  authtoken: $tokenValue`n  web_addr: 127.0.0.1:4040`n"
    [System.IO.File]::WriteAllText($ngrokConfig, $yaml)
    Set-PrivateFile $ngrokConfig
    & $ngrokPath config check --config $ngrokConfig
    if ($LASTEXITCODE -ne 0) { throw 'La configuración de ngrok no pasó la validación.' }
    Write-Output 'ngrok configurado para este proyecto. Usa start.ps1 -Tunnel.'
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $tokenValue = $null
    $yaml = $null
    $secureToken.Dispose()
  }
}

Write-Output 'El mismo AI_GATEWAY_SECRET debe guardarse en Render, únicamente en el servicio API. El archivo .env local está excluido de Git.'
