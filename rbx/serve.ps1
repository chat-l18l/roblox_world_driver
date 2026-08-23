# Start Rojo live-sync from this folder.
Set-Location $PSScriptRoot
if (-not (Get-Command rojo -ErrorAction SilentlyContinue)) {
  Write-Host "rojo niet gevonden. Eerst: rokit install (in rbx/) en restart de terminal."
  exit 1
}
rojo serve
