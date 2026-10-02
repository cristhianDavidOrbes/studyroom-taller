[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$registry='HKCU:\Software\Classes\studyroom-tools'
$installed=Get-ItemProperty -LiteralPath $registry -ErrorAction SilentlyContinue
$target=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'StudyRoom/Herramientas'))
$expectedParent=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'StudyRoom'))+[IO.Path]::DirectorySeparatorChar
if(!$target.StartsWith($expectedParent,[StringComparison]::OrdinalIgnoreCase)){throw 'Ruta de desinstalación no válida.'}
if($installed) {
  if($installed.StudyRoomOwner -ne 'StudyRoom.Tools.v1' -or $installed.StudyRoomPath -ne $target){throw 'El registro no pertenece a esta instalación. No se modificó.'}
  Remove-Item -LiteralPath $registry -Recurse
}
$executable=Join-Path $target 'StudyRoom.Tools.exe'
$running=Get-Process -Name 'StudyRoom.Tools' -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $executable }
if($running){Write-Output 'El protocolo ya fue retirado. Cierra las herramientas y repite para retirar los archivos.';exit 0}
foreach($name in @('StudyRoom.Tools.exe','StudyRoom.Tools.exe.config','Iniciar-Herramientas.cmd','Instalar-Herramientas.cmd','Desinstalar-Herramientas.cmd','LEEME.txt','SHA256SUMS.txt')) {
  $file=Join-Path $target $name
  if(Test-Path -LiteralPath $file){Remove-Item -LiteralPath $file}
}
Write-Output 'Herramientas desinstaladas para este usuario. No se modificaron otras aplicaciones.'
