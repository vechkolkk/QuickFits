$ErrorActionPreference = "Stop"

Write-Host "Installing QuickFits dependencies..."
npm install

Write-Host "Configuring Git hooks..."
git config core.hooksPath .githooks

Write-Host "Bootstrap complete. Future git pulls will install dependencies after merge."
