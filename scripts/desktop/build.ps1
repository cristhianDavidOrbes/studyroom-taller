[CmdletBinding()]
param([switch]$Test)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$source = Join-Path $projectRoot 'apps/desktop'
$output = Join-Path $source 'dist'
$framework = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319'
if (!(Test-Path -LiteralPath (Join-Path $framework 'csc.exe'))) { $framework = Join-Path $env:WINDIR 'Microsoft.NET/Framework/v4.0.30319' }
$compiler = Join-Path $framework 'csc.exe'
if (!(Test-Path -LiteralPath $compiler)) { throw 'Se necesita .NET Framework 4.8 para compilar las herramientas.' }
New-Item -ItemType Directory -Path $output -Force | Out-Null
$references = @('System.dll','System.Core.dll','System.Drawing.dll','System.Windows.Forms.dll','System.Web.Extensions.dll','System.Xaml.dll','WPF/WindowsBase.dll','WPF/PresentationCore.dll','WPF/PresentationFramework.dll') | ForEach-Object { '/reference:' + (Join-Path $framework $_) }
$arguments = @('/nologo','/utf8output','/optimize+','/platform:anycpu','/target:winexe',('/out:'+(Join-Path $output 'StudyRoom.Tools.exe')),('/win32manifest:'+(Join-Path $source 'StudyRoom.Tools.exe.manifest'))) + $references + @((Join-Path $source 'Model.cs'),(Join-Path $source 'Native.cs'),(Join-Path $source 'App.cs'),(Join-Path $source 'Setup.cs'),(Join-Path $source 'Bridge.cs'))
& $compiler @arguments
if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación de las herramientas.' }
$config = '<?xml version="1.0"?><configuration><startup useLegacyV2RuntimeActivationPolicy="true"><supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8" /></startup><runtime><AppContextSwitchOverrides value="Switch.System.Windows.DoNotScaleForDpiChanges=false" /></runtime></configuration>'
[IO.File]::WriteAllText((Join-Path $output 'StudyRoom.Tools.exe.config'),$config)
Copy-Item -LiteralPath (Join-Path $projectRoot 'Iniciar-Herramientas.cmd') -Destination $output -Force
Copy-Item -LiteralPath (Join-Path $source 'LEEME.txt') -Destination $output -Force
Copy-Item -LiteralPath (Join-Path $source 'Instalar-Herramientas.cmd') -Destination $output -Force
Copy-Item -LiteralPath (Join-Path $source 'Desinstalar-Herramientas.cmd') -Destination $output -Force
if ($Test) {
  $testArguments = @('/nologo','/utf8output','/optimize+','/target:exe',('/out:'+(Join-Path $output 'ModelTests.exe'))) + $references + @((Join-Path $source 'Model.cs'),(Join-Path $source 'Native.cs'),(Join-Path $source 'Bridge.cs'),(Join-Path $source 'ModelTests.cs'))
  & $compiler @testArguments
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron compilar las pruebas.' }
  & (Join-Path $output 'ModelTests.exe')
  if ($LASTEXITCODE -ne 0) { throw 'Falló una prueba del modelo de dibujo.' }
}
Write-Output 'Compilación lista: apps/desktop/dist/StudyRoom.Tools.exe (.NET Framework 4.8).'
