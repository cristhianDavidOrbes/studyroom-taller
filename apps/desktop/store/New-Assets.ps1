param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Path $Destination -Force | Out-Null
# Original geometric pencil artwork; no fonts, downloaded assets or external tools.
foreach ($asset in @(@{Name='StoreLogo.png';Size=50},@{Name='Square44x44Logo.png';Size=44},@{Name='Square150x150Logo.png';Size=150})) {
  $size = $asset.Size
  $bitmap = [Drawing.Bitmap]::new($size,$size)
  $graphics = [Drawing.Graphics]::FromImage($bitmap)
  $tile = [Drawing.Drawing2D.GraphicsPath]::new()
  $green = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255,23,119,105))
  $white = [Drawing.SolidBrush]::new([Drawing.Color]::White)
  $gold = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255,250,201,108))
  try {
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([Drawing.Color]::Transparent)
    $graphics.ScaleTransform($size/100.0,$size/100.0)
    $tile.AddArc(4,4,28,28,180,90); $tile.AddArc(68,4,28,28,270,90)
    $tile.AddArc(68,68,28,28,0,90); $tile.AddArc(4,68,28,28,90,90); $tile.CloseFigure()
    $graphics.FillPath($green,$tile)
    $shaft = [Drawing.PointF[]]@([Drawing.PointF]::new(32,61),[Drawing.PointF]::new(61,32),[Drawing.PointF]::new(71,42),[Drawing.PointF]::new(42,71))
    $nib = [Drawing.PointF[]]@([Drawing.PointF]::new(29,74),[Drawing.PointF]::new(32,61),[Drawing.PointF]::new(42,71))
    $cap = [Drawing.PointF[]]@([Drawing.PointF]::new(63,30),[Drawing.PointF]::new(69,24),[Drawing.PointF]::new(79,34),[Drawing.PointF]::new(73,40))
    $graphics.FillPolygon($white,$shaft); $graphics.FillPolygon($gold,$nib); $graphics.FillPolygon($gold,$cap)
    $bitmap.Save((Join-Path $Destination $asset.Name),[Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $gold.Dispose(); $white.Dispose(); $green.Dispose(); $tile.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
  }
}
