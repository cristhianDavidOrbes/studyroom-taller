. (Join-Path $PSScriptRoot 'common.ps1')
$speechState = Join-Path $GatewayState 'speech'
$speechPython = Join-Path $speechState 'venv/Scripts/python.exe'
$speechModelDir = Join-Path $speechState 'model-small'
if (!(Test-Path -LiteralPath $speechPython) -or !(Test-Path -LiteralPath (Join-Path $speechModelDir 'studyroom-model.json'))) {
  Write-Output 'Transcripción no instalada todavía. Ejecuta scripts/local-ai/setup-speech.ps1; la IA de texto puede continuar.'
  return
}
$existingSpeech = Get-OwnedProcess 'speech'
$existingLauncher = Get-OwnedProcess 'speech-launcher'
if (!$existingSpeech -and !$existingLauncher) {
  if (Get-NetTCPConnection -LocalPort 8788 -State Listen -ErrorAction SilentlyContinue) { throw 'El puerto local de voz 8788 está ocupado por otro proceso. No se modificará.' }
  $speechArgs = @(('"' + (Join-Path $GatewayDir 'speech/worker.py') + '"'), '--model-dir', ('"' + $speechModelDir + '"'), '--env-file', ('"' + (Join-Path $GatewayDir '.env') + '"'))
  $speechProcess = Start-Process -FilePath $speechPython -ArgumentList $speechArgs -WorkingDirectory $GatewayDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $speechState 'speech.stdout.log') -RedirectStandardError (Join-Path $speechState 'speech.stderr.log') -PassThru
  Save-OwnedProcess 'speech-launcher' $speechProcess
  $existingLauncher = $speechProcess
}
$secretValue = Read-GatewaySecret
try {
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
      $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8788/health' -Headers @{ Authorization = "Bearer $secretValue" } -TimeoutSec 2
      if ($health.status -eq 'ready') {
        # The Windows venv redirector creates a child Python process. Register
        # the actual verified listener as well as its launcher for clean stop.
        $listener = Get-NetTCPConnection -LocalPort 8788 -State Listen -ErrorAction Stop | Select-Object -First 1
        $workerInfo = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $listener.OwningProcess)
        $allowedParent = if ($existingLauncher) { $existingLauncher.Id } elseif ($existingSpeech) { $existingSpeech.Id } else { $null }
        $workerSource = Join-Path $GatewayDir 'speech/worker.py'
        if (!$workerInfo -or !$workerInfo.CommandLine.Contains(('"' + $workerSource + '"')) -or ($workerInfo.ProcessId -ne $allowedParent -and $workerInfo.ParentProcessId -ne $allowedParent -and (!$existingSpeech -or $workerInfo.ProcessId -ne $existingSpeech.Id))) { throw 'El reconocedor de voz no coincide con el proceso iniciado por StudyRoom.' }
        if (!$existingLauncher -and $existingSpeech -and $workerInfo.ParentProcessId -eq $existingSpeech.Id) { Save-OwnedProcess 'speech-launcher' $existingSpeech }
        Save-OwnedProcess 'speech' (Get-Process -Id $workerInfo.ProcessId)
        Write-Output 'Speech-to-text local listo, privado y sin proveedor de pago.'
        return
      }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  Write-Output 'El modelo de voz todavía no inició. La aplicación mostrará transcripción indisponible; revisa el registro local de voz.'
} finally { $secretValue = $null }
