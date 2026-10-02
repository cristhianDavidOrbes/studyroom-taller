[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$output=[IO.Path]::GetFullPath((Join-Path $projectRoot 'apps/desktop/dist'))
$names=@('StudyRoom.Tools.exe','StudyRoom.Tools.exe.config','Iniciar-Herramientas.cmd','Instalar-Herramientas.cmd','Desinstalar-Herramientas.cmd','LEEME.txt')
foreach($name in $names){if(!(Test-Path -LiteralPath (Join-Path $output $name))){throw "Falta $name. Ejecuta build.ps1 -Test primero."}}
$hashes=@($names | ForEach-Object { (Get-FileHash -LiteralPath (Join-Path $output $_) -Algorithm SHA256).Hash.ToLowerInvariant()+'  '+$_ })
[IO.File]::WriteAllLines((Join-Path $output 'SHA256SUMS.txt'),$hashes,[Text.UTF8Encoding]::new($false))
Add-Type -AssemblyName System.IO.Compression.FileSystem
$temporary=Join-Path $output ('package-'+[Guid]::NewGuid().ToString('N')+'.zip')
$archive=[IO.Compression.ZipFile]::Open($temporary,[IO.Compression.ZipArchiveMode]::Create)
try {
  foreach($name in ($names+@('SHA256SUMS.txt'))) { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $output $name),$name,[IO.Compression.CompressionLevel]::Optimal) | Out-Null }
} finally { $archive.Dispose() }
$destination=Join-Path $output 'StudyRoom-Herramientas.zip'
Move-Item -LiteralPath $temporary -Destination $destination -Force
$hash=(Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText((Join-Path $output 'StudyRoom-Herramientas.zip.sha256'),$hash+'  StudyRoom-Herramientas.zip'+[Environment]::NewLine,[Text.UTF8Encoding]::new($false))
Write-Output ('Paquete: '+$destination)
Write-Output ('SHA-256: '+$hash)
