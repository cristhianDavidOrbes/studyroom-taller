param([switch]$TunnelOnly)
. (Join-Path $PSScriptRoot 'common.ps1')
$names = if ($TunnelOnly) { @('watchdog', 'ngrok') } else { @('watchdog', 'ngrok', 'gateway', 'speech', 'speech-launcher', 'ollama') }
foreach ($name in $names) {
  $owned = Get-OwnedProcess $name
  if ($owned) { Stop-Process -Id $owned.Id; Write-Output ("Detenido: $name") }
}
Write-Output 'Solo se detuvieron los procesos de StudyRoom registrados con su hora de inicio. Los modelos y datos permanecen guardados.'
