param([ValidateSet('all', 'background', 'resume')][string]$Mode = 'background')
. (Join-Path $PSScriptRoot 'common.ps1')
$pausePath = Join-Path $GatewayState 'pause'
if ($Mode -eq 'resume') {
  if (Test-Path -LiteralPath $pausePath) { Remove-Item -LiteralPath $pausePath }
  Write-Output 'IA reanudada.'
} else {
  Set-Content -LiteralPath $pausePath -Value $Mode
  Write-Output 'Las nuevas generaciones seleccionadas quedan en espera para proteger la llamada. Una generación ya iniciada termina o puede cancelarse desde la aplicación.'
}
