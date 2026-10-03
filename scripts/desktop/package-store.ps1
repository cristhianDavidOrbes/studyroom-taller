[CmdletBinding()]
param(
  [switch]$PreparationOnly,
  [string]$PackageName,
  [string]$Publisher,
  [string]$PublisherDisplayName,
  [string]$DisplayName = 'Herramientas StudyRoom',
  [string]$Version = '1.1.0.0'
)
$ErrorActionPreference = 'Stop'
if ($PreparationOnly) {
  if ($PackageName -or $Publisher -or $PublisherDisplayName) { throw 'PreparationOnly no acepta identidad real. Usa un modo a la vez.' }
  $PackageName = 'PreparationOnly.StudyRoom.Tools'
  $Publisher = 'CN=PREPARATION-ONLY-NOT-A-STORE-IDENTITY'
  $PublisherDisplayName = 'BORRADOR TECNICO - NO PUBLICABLE'
  $DisplayName = 'StudyRoom - NO PUBLICABLE'
  $description = 'BORRADOR TECNICO - NO PUBLICABLE. La identidad y certificacion de Microsoft Store estan pendientes.'
} else {
  foreach ($value in @($PackageName,$Publisher,$PublisherDisplayName)) {
    if ([string]::IsNullOrWhiteSpace($value) -or $value -match '__|PreparationOnly|PREPARATION-ONLY|NO PUBLICABLE|PLACEHOLDER') {
      throw 'Se requieren PackageName, Publisher y PublisherDisplayName exactos de Product identity en Partner Center. Usa -PreparationOnly mientras no existan.'
    }
  }
  if ($PackageName -notmatch '^[a-zA-Z0-9.-]{3,50}$' -or $Publisher -notmatch '^CN=') { throw 'La identidad no tiene un formato valido para Microsoft Store.' }
  $description = 'Herramientas para dibujar sobre el escritorio mientras compartes pantalla en StudyRoom.'
}
if ($Version -notmatch '^\d+\.\d+\.\d+\.0$') { throw 'La version Store debe tener cuatro numeros y terminar en .0.' }
$parts = @($Version.Split('.') | ForEach-Object { [int]$_ })
if ($parts[0] -eq 0 -or @($parts | Where-Object { $_ -gt 65535 }).Count) { throw 'Version fuera del intervalo permitido por Store.' }

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$source = Join-Path $projectRoot 'apps/desktop'
$framework = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319'
$compiler = Join-Path $framework 'csc.exe'
$sdk = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits/10/bin/10.0.26100.0/x64'
$makeappx = Join-Path $sdk 'makeappx.exe'
foreach ($tool in @($compiler,$makeappx)) { if (!(Test-Path -LiteralPath $tool -PathType Leaf)) { throw "Herramienta requerida no disponible: $tool" } }

$dist = [IO.Path]::GetFullPath((Join-Path $source 'dist/store'))
$label = if ($PreparationOnly) { 'NO-PUBLICABLE' } else { 'STORE-SUBMISSION-UNSIGNED' }
$output = [IO.Path]::GetFullPath((Join-Path $dist ($label+'-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fffffff'))))
if (!$output.StartsWith($dist+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'La salida debe permanecer dentro del directorio Store.' }
$package = Join-Path $output 'Package'
New-Item -ItemType Directory -Path $package | Out-Null
$references = @('System.dll','System.Core.dll','System.Drawing.dll','System.Windows.Forms.dll','System.Web.Extensions.dll','System.Xaml.dll','WPF/WindowsBase.dll','WPF/PresentationCore.dll','WPF/PresentationFramework.dll') | ForEach-Object { '/reference:'+(Join-Path $framework $_) }
# Never compile Setup, Installer or InstallerPayload into the Store executable.
$inputs = @('Model.cs','Native.cs','App.cs','Bridge.cs','AssemblyInfo.cs')
$arguments = @('/nologo','/utf8output','/optimize+','/platform:x64','/define:STORE_PACKAGE','/target:winexe',('/out:'+(Join-Path $package 'StudyRoom.Tools.exe')),('/win32manifest:'+(Join-Path $source 'StudyRoom.Tools.exe.manifest'))) + $references + @($inputs | ForEach-Object { Join-Path $source $_ })
& $compiler @arguments
if ($LASTEXITCODE -ne 0) { throw 'Fallo la compilacion exclusiva para Store.' }
$config = '<?xml version="1.0"?><configuration><startup useLegacyV2RuntimeActivationPolicy="true"><supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8" /></startup><runtime><AppContextSwitchOverrides value="Switch.System.Windows.DoNotScaleForDpiChanges=false" /></runtime></configuration>'
[IO.File]::WriteAllText((Join-Path $package 'StudyRoom.Tools.exe.config'),$config,[Text.UTF8Encoding]::new($false))
& (Join-Path $source 'store/New-Assets.ps1') -Destination (Join-Path $package 'Assets')

[xml]$manifest = Get-Content -LiteralPath (Join-Path $source 'store/AppxManifest.template.xml') -Raw
$namespaces = [Xml.XmlNamespaceManager]::new($manifest.NameTable)
$namespaces.AddNamespace('p','http://schemas.microsoft.com/appx/manifest/foundation/windows10')
$namespaces.AddNamespace('uap','http://schemas.microsoft.com/appx/manifest/uap/windows10')
$namespaces.AddNamespace('uap3','http://schemas.microsoft.com/appx/manifest/uap/windows10/3')
$namespaces.AddNamespace('desktop','http://schemas.microsoft.com/appx/manifest/desktop/windows10')
$namespaces.AddNamespace('rescap','http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities')
$identity = $manifest.SelectSingleNode('/p:Package/p:Identity',$namespaces)
$identity.SetAttribute('Name',$PackageName); $identity.SetAttribute('Publisher',$Publisher); $identity.SetAttribute('Version',$Version)
$manifest.SelectSingleNode('/p:Package/p:Properties/p:DisplayName',$namespaces).InnerText = $DisplayName
$manifest.SelectSingleNode('/p:Package/p:Properties/p:PublisherDisplayName',$namespaces).InnerText = $PublisherDisplayName
$manifest.SelectSingleNode('/p:Package/p:Properties/p:Description',$namespaces).InnerText = $description
$visual = $manifest.SelectSingleNode('//uap:VisualElements',$namespaces)
$visual.SetAttribute('DisplayName',$DisplayName); $visual.SetAttribute('Description',$description)
if ($manifest.OuterXml -match '__[A-Z_]+__') { throw 'Quedan marcadores sin resolver en el manifiesto.' }
if ($manifest.SelectSingleNode('//p:Application',$namespaces).GetAttribute('EntryPoint') -ne 'Windows.FullTrustApplication') { throw 'Se requiere la aplicacion WPF full trust.' }
if ($manifest.SelectSingleNode('//uap3:Protocol',$namespaces).GetAttribute('Name') -ne 'studyroom-tools') { throw 'Falta el protocolo declarativo.' }
if ($manifest.SelectSingleNode('//desktop:StartupTask',$namespaces).GetAttribute('TaskId') -ne 'StudyRoomTools') { throw 'Falta el inicio declarativo.' }
if ($manifest.SelectNodes('//rescap:Capability',$namespaces).Count -ne 1 -or $manifest.SelectSingleNode('//rescap:Capability',$namespaces).GetAttribute('Name') -ne 'runFullTrust') { throw 'Solo se admite runFullTrust como capacidad restringida.' }
$manifest.Save((Join-Path $package 'AppxManifest.xml'))
$notice = if ($PreparationOnly) { 'BORRADOR TECNICO - NO PUBLICABLE. No instalar, distribuir ni subir a Store: contiene marcadores de identidad.' } else { 'PAQUETE SIN FIRMA PARA ENVIO A MICROSOFT STORE. No distribuir para instalacion directa. La tienda debe certificarlo y firmarlo primero.' }
[IO.File]::WriteAllText((Join-Path $package 'LEEME-STORE.txt'),($notice+"`r`nWindows administra el protocolo, inicio, actualizaciones y desinstalacion. Abre la aplicacion una vez para registrar el inicio; puedes desactivarlo en Configuracion de Windows.`r`nComparte Pantalla completa para mostrar tus marcas. La herramienta escucha solo en 127.0.0.1:8790.`r`n"),[Text.UTF8Encoding]::new($false))
$artifact = Join-Path $output ('StudyRoom.Tools-'+$Version+'-x64-'+$label+'.msix')
& $makeappx pack /d $package /p $artifact /h SHA256 /no
if ($LASTEXITCODE -ne 0) { throw 'MakeAppx rechazo el paquete. No se desactivo la validacion.' }

# Read back the actual archive and verify every source file; never install or run it.
$roundtrip = Join-Path $output 'Unpacked-Verification'
& $makeappx unpack /p $artifact /d $roundtrip /no
if ($LASTEXITCODE -ne 0) { throw 'No se pudo verificar el archivo MSIX generado.' }
$files = @(Get-ChildItem -LiteralPath $package -Recurse -File)
$hashes = @()
foreach ($file in $files) {
  $relative = $file.FullName.Substring($package.Length+1)
  $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($hash -ne (Get-FileHash -LiteralPath (Join-Path $roundtrip $relative) -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "Integridad MSIX incorrecta: $relative" }
  $hashes += $hash+'  Package/'+$relative.Replace('\','/')
}
$artifactHash = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash.ToLowerInvariant()
$hashes += $artifactHash+'  '+[IO.Path]::GetFileName($artifact)
[IO.File]::WriteAllLines((Join-Path $output 'SHA256SUMS.txt'),$hashes,[Text.UTF8Encoding]::new($false))
$evidence = [ordered]@{ mode=$label; preparationOnly=[bool]$PreparationOnly; identitySource=$(if ($PreparationOnly) {'explicit preparation markers; not a Store identity'} else {'caller-supplied Partner Center values; reservation still requires Store verification'}); packageName=$PackageName; publisher=$Publisher; version=$Version; architecture='x64'; compiledSources=$inputs; makeappxValidation='passed'; archiveRoundtrip='passed'; verifiedFiles=$files.Count; sha256=$artifactHash; signed=$false; installed=$false; executed=$false; published=$false; artifact=$artifact; requiredNext=$(if ($PreparationOnly) {'Real Microsoft developer account, reserved Product identity, final packaging, runtime/WACK tests and Store certification'} else {'Runtime/WACK tests and Microsoft Store certification/signing before customer distribution'}) }
[IO.File]::WriteAllText((Join-Path $output 'verification.json'),($evidence | ConvertTo-Json -Depth 5),[Text.UTF8Encoding]::new($false))
Write-Output "$label - compilacion, manifiesto MakeAppx e integridad verificados. No se firmo, instalo, ejecuto ni publico la aplicacion."
Write-Output $artifact
