. (Join-Path $PSScriptRoot 'common.ps1')
$speechState = Join-Path $GatewayState 'speech'
$speechPython = Join-Path $speechState 'venv/Scripts/python.exe'
$speechSource = Join-Path $GatewayDir 'speech'
New-Item -ItemType Directory -Path $speechState -Force | Out-Null
if (!(Test-Path -LiteralPath $speechPython)) {
  $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
  if (!$pythonCommand) { throw 'Instala Python 3.12 desde https://www.python.org/downloads/windows/ para habilitar la transcripción local.' }
  & $pythonCommand.Source -c 'import sys; assert sys.version_info[:2] == (3,12) and sys.maxsize > 2**32, ''Se necesita Python 3.12 de 64 bits'''
  if ($LASTEXITCODE -ne 0) { throw 'Instala Python 3.12 de 64 bits. Las dependencias fijadas de voz no admiten Python 3.9 a 3.11; otras versiones no están verificadas.' }
  & $pythonCommand.Source -m venv (Join-Path $speechState 'venv')
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el entorno local de voz.' }
}
& $speechPython -c 'import sys; assert sys.version_info[:2] == (3,12) and sys.maxsize > 2**32, ''El entorno local de voz necesita Python 3.12 de 64 bits'''
if ($LASTEXITCODE -ne 0) { throw 'El entorno de voz existente usa una versión no compatible. Instala Python 3.12 de 64 bits y vuelve a crear ese entorno antes de instalar dependencias; los modelos permanecen separados.' }
Write-Output 'Instalando el reconocimiento de voz gratuito dentro del proyecto.'
& $speechPython -m pip install --disable-pip-version-check --only-binary=:all: -r (Join-Path $speechSource 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'La instalación de voz no terminó; se conservará el estado indisponible sin inventar transcripciones.' }
$speechModelDir = Join-Path $speechState 'model-small'
if (!(Test-Path -LiteralPath (Join-Path $speechModelDir 'studyroom-model.json')) -or !(Test-Path -LiteralPath (Join-Path $speechModelDir 'vocabulary.txt'))) {
  Write-Output 'Descargando Whisper small multilingüe (aproximadamente 0,5 GB), solo una vez.'
  & $speechPython (Join-Path $speechSource 'setup.py') --model-dir $speechModelDir
  if ($LASTEXITCODE -ne 0) { throw 'No terminó la descarga del modelo de voz. Vuelve a ejecutar setup-speech.ps1.' }
}
Write-Output 'Speech-to-text local instalado. Iniciar-IA.cmd lo iniciará junto con la IA.'
