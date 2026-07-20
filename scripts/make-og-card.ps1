# Regenerates public/og-card.png from scripts/share-card.html via headless Chrome.
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" }
$root = Split-Path $PSScriptRoot -Parent
& $chrome --headless=new --disable-gpu --user-data-dir="$env:TEMP\chrome-og" --window-size=1200,630 --hide-scrollbars --force-device-scale-factor=1 `
  --screenshot="$root\public\og-card.png" "file:///$(($PSScriptRoot -replace '\\','/') -replace ' ','%20')/share-card.html"
