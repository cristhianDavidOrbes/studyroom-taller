param([switch]$PublicTunnel)
. (Join-Path $PSScriptRoot 'common.ps1')
$baseUrl = 'http://127.0.0.1:8787'
if ($PublicTunnel) {
  $tunnel = Get-Content -LiteralPath (Join-Path $GatewayState 'public-url.json') -Raw | ConvertFrom-Json
  $baseUrl = $tunnel.AI_GATEWAY_URL
  if ($baseUrl -notmatch '^https://[a-z0-9-]+\.ngrok-free\.(app|dev)$') { throw 'La URL del túnel gratuito no es válida.' }
}
$secretValue = Read-GatewaySecret
$cases = @(
  @{ name = 'espanol'; prompt = 'Explica en dos frases qué es la fotosíntesis y por qué las plantas necesitan luz.'; system = 'Eres un tutor de ciencias. Responde en español con precisión.'; maxTokens = 180 },
  @{ name = 'resumen_fiel'; prompt = 'Resume únicamente estos hechos en español: Ana y Luis estudiaron ecuaciones lineales. Resolvieron 2x + 4 = 10 y obtuvieron x = 3. Acordaron practicar cinco ejercicios mañana. No se discutieron otros temas.'; system = 'Resume el contexto dado sin inventar información. Separa resumen y acuerdo.'; maxTokens = 220 },
  @{ name = 'consulta_reporte'; prompt = 'Pregunta: ¿Qué valor de x obtuvieron? Reporte: Ana y Luis resolvieron 2x + 4 = 10. Restaron 4 a ambos lados y dividieron por 2: obtuvieron x = 3. Responde en una frase usando solo este reporte.'; system = 'Responde en español basándote únicamente en el reporte recibido.'; maxTokens = 180 }
)
$results = @()
try {
  $unauthorizedStatus = $null
  try { $null = Invoke-WebRequest -Uri ($baseUrl + '/v1/health') -TimeoutSec 15; throw 'La ruta privada aceptó acceso sin credencial.' }
  catch { $unauthorizedStatus = [int]$_.Exception.Response.StatusCode; if ($unauthorizedStatus -ne 401) { throw } }
  foreach ($case in $cases) {
    $body = @{ prompt = $case.prompt; system = $case.system; maxTokens = $case.maxTokens; stream = $false } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri ($baseUrl + '/v1/generate') -Method Post -ContentType 'application/json; charset=utf-8' -Headers @{ Authorization = "Bearer $secretValue" } -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 150
    if ($response.text -match '<think>|Okay,|Let me think') { throw ('Se detectó salida interna sin respuesta final en: ' + $case.name) }
    if ($case.name -eq 'consulta_reporte' -and $response.text -notmatch '\b3\b') { throw 'La respuesta no coincide con el dato del reporte de prueba.' }
    $results += @{ name = $case.name; prompt = $case.prompt; response = $response }
  }
  $streamBody = @{prompt='Responde exactamente: StudyRoom conectado.';system='Sigue la instrucción.';maxTokens=32;stream=$true} | ConvertTo-Json
  $streamResponse = Invoke-WebRequest -Uri ($baseUrl + '/v1/generate') -Method Post -ContentType 'application/json' -Headers @{Authorization="Bearer $secretValue"} -Body ([Text.Encoding]::UTF8.GetBytes($streamBody)) -TimeoutSec 150
  $streamText = if ($streamResponse.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($streamResponse.Content) } else { [string]$streamResponse.Content }
  $streamEvents = $streamText.Trim().Split("`n") | ForEach-Object { $_ | ConvertFrom-Json }
  if ($streamEvents[-1].type -ne 'done') { throw 'Streaming no produjo el evento final.' }
  $tags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags'
  $model = $tags.models | Where-Object name -eq 'qwen3:4b-instruct'
  $show = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/show' -Method Post -ContentType 'application/json' -Body '{"model":"qwen3:4b-instruct"}'
  $gpu = $null
  if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) { $gpu = nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu --format=csv,noheader }
  $record = @{observedAt=[DateTime]::UtcNow.ToString('o');endpoint=$baseUrl;model=$model;license=($show.license -split "`n" | Select-Object -First 4);gpu=$gpu;tests=$results;unauthorizedStatus=$unauthorizedStatus;streamEvents=$streamEvents;livekitCallTestExecuted=$false;publicTunnelTestExecuted=[bool]$PublicTunnel;qualityAssessment='Revisar manualmente fidelidad, idioma y respuesta correcta de las muestras guardadas; no es una evaluación estadística.'}
  $fileName = if ($PublicTunnel) { 'tunnel-verification.json' } else { 'model-verification.json' }
  $record | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $GatewayDir $fileName)
  Write-Output ('Verificación guardada en apps/ai-gateway/' + $fileName)
  $results | ForEach-Object { [PSCustomObject]@{prueba=$_.name;texto=$_.response.text;tokensPorSegundo=$_.response.usage.tokensPerSecond;primerTokenMs=$_.response.usage.firstTokenMs} } | Format-List
} finally { $secretValue = $null }
