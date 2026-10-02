[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
if (!(Test-Path -LiteralPath (Join-Path $source 'StudyRoom.Tools.exe'))) { $source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../apps/desktop/dist')) }
if (!(Test-Path -LiteralPath (Join-Path $source 'StudyRoom.Tools.exe'))) { throw 'No se encuentra StudyRoom.Tools.exe. Extrae primero todo el ZIP o compila el proyecto.' }
$target = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'StudyRoom/Herramientas'))
$expectedParent = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'StudyRoom')) + [IO.Path]::DirectorySeparatorChar
if (!$target.StartsWith($expectedParent,[StringComparison]::OrdinalIgnoreCase)) { throw 'Ruta de instalación no válida.' }
$registry = 'HKCU:\Software\Classes\studyroom-tools'
$existing = Get-ItemProperty -LiteralPath $registry -ErrorAction SilentlyContinue
if ($existing -and $existing.StudyRoomOwner -ne 'StudyRoom.Tools.v1') { throw 'El protocolo studyroom-tools ya pertenece a otra instalación. No se sobrescribió.' }
New-Item -ItemType Directory -Path $target -Force | Out-Null
foreach ($name in @('StudyRoom.Tools.exe','StudyRoom.Tools.exe.config','Iniciar-Herramientas.cmd','Instalar-Herramientas.cmd','Desinstalar-Herramientas.cmd','LEEME.txt','SHA256SUMS.txt')) {
  $file=Join-Path $source $name
  if (Test-Path -LiteralPath $file) { if (![StringComparer]::OrdinalIgnoreCase.Equals([IO.Path]::GetFullPath($file),[IO.Path]::GetFullPath((Join-Path $target $name)))) { Copy-Item -LiteralPath $file -Destination (Join-Path $target $name) -Force } }
}
$executable = Join-Path $target 'StudyRoom.Tools.exe'
New-Item -Path $registry -Force | Out-Null
Set-Item -LiteralPath $registry -Value 'URL:Herramientas StudyRoom'
New-ItemProperty -LiteralPath $registry -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath $registry -Name 'StudyRoomOwner' -Value 'StudyRoom.Tools.v1' -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath $registry -Name 'StudyRoomPath' -Value $target -PropertyType String -Force | Out-Null
New-Item -Path ($registry+'\shell\open\command') -Force | Out-Null
Set-Item -LiteralPath ($registry+'\shell\open\command') -Value ('"'+$executable+'" "%1"')
Write-Output 'Instalado para tu usuario. El botón web puede abrir studyroom-tools://open. Sin administrador ni inicio automático.'
