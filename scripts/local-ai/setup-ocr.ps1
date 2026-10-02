param()
. (Join-Path $PSScriptRoot 'common.ps1')
$ocrDirectory=Join-Path $GatewayState 'ocr-data'
New-Item -ItemType Directory -Path $ocrDirectory -Force | Out-Null
$ocrRevision='87416418657359cb625c412a48b6e1d6d41c29bd'
$ocrHashes=@{spa='6f2e04d02774a18f01bed44b1111f2cd7f3ba7ac9dc4373cd3f898a40ea6b464';eng='7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2'}
foreach($ocrLanguage in @('spa','eng')) {
  $ocrTarget=Join-Path $ocrDirectory ($ocrLanguage+'.traineddata')
  if(!(Test-Path -LiteralPath $ocrTarget)) {
    $ocrTemporary=$ocrTarget+'.tmp'
    Invoke-WebRequest -Uri ('https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/'+$ocrRevision+'/'+$ocrLanguage+'.traineddata') -OutFile $ocrTemporary -TimeoutSec 60
    if((Get-FileHash -LiteralPath $ocrTemporary -Algorithm SHA256).Hash.ToLowerInvariant() -ne $ocrHashes[$ocrLanguage]){throw 'La descarga del lector de imágenes está incompleta o no coincide con la versión esperada.'}
    Move-Item -LiteralPath $ocrTemporary -Destination $ocrTarget -Force
  }
  if((Get-FileHash -LiteralPath $ocrTarget -Algorithm SHA256).Hash.ToLowerInvariant() -ne $ocrHashes[$ocrLanguage]){throw 'El modelo local de lectura de imágenes no coincide con la versión esperada.'}
  Write-Output ($ocrLanguage+': '+(Get-FileHash -LiteralPath $ocrTarget -Algorithm SHA256).Hash.ToLowerInvariant())
}
Write-Output 'Lectura de texto de imágenes lista. Funciona localmente, sin servicio de pago.'
