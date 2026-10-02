param([switch]$WorkerOnly)
. (Join-Path $PSScriptRoot 'common.ps1')
Add-Type -AssemblyName System.Speech
$speechFixture = Join-Path $GatewayState 'speech/synthetic-verification.wav'
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $spanishVoice = $synth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
  if ($spanishVoice) { $synth.SelectVoice($spanishVoice.VoiceInfo.Name); $speechLanguage = 'es'; $phrase = 'Hola, estamos estudiando juntos. El reporte contiene la transcripción de nuestra conversación.' }
  else { $speechLanguage = 'en'; $phrase = 'Hello, we are studying together. The report contains the transcript of our conversation.' }
  $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  $synth.SetOutputToWaveFile($speechFixture, $format)
  $synth.Speak($phrase)
} finally { $synth.Dispose() }
$secretValue = Read-GatewaySecret
try {
  $payload = @{ audioBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($speechFixture)); mimeType = 'audio/wav'; language = $speechLanguage } | ConvertTo-Json -Compress
  $timer = [Diagnostics.Stopwatch]::StartNew()
  $speechUri = if ($WorkerOnly) { 'http://127.0.0.1:8788/v1/transcribe' } else { 'http://127.0.0.1:8787/v1/transcribe' }
  $result = Invoke-RestMethod -Uri $speechUri -Method Post -ContentType 'application/json' -Body $payload -Headers @{ Authorization = "Bearer $secretValue" } -TimeoutSec 130
  $timer.Stop()
  $wordCount = @($result.segments | ForEach-Object { $_.words } | Where-Object { $_.word }).Count
  if (!$result.text -or $wordCount -lt 5 -or $result.model -ne 'faster-whisper-small') { throw 'La prueba de voz sintética no produjo una transcripción real con palabras y tiempos.' }
  $evidence = @{ observedAt = [DateTime]::UtcNow.ToString('o'); source = 'Windows SAPI synthetic voice; no user microphone'; route = $speechUri; language = $speechLanguage; expectedPhrase = $phrase; recognizedText = $result.text; durationMs = $result.durationMs; elapsedMs = $timer.ElapsedMilliseconds; words = $wordCount; model = $result.model; fixtureSha256 = (Get-FileHash -LiteralPath $speechFixture -Algorithm SHA256).Hash.ToLower(); limitations = @('synthetic voice only', 'does not certify perfect recognition of human conversations') }
  $evidence | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $GatewayState 'speech/verification.json')
  $evidence | ConvertTo-Json -Depth 5
} finally { $secretValue = $null; $payload = $null }
