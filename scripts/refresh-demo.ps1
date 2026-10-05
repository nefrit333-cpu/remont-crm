Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
. (Join-Path $PSScriptRoot 'lib.ps1')

$php = Resolve-PhpExecutable

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created .env from .env.example'
}

if (-not (Test-Path 'database')) {
    New-Item -ItemType Directory -Path 'database' | Out-Null
}

if (-not (Test-Path 'database/database.sqlite')) {
    New-Item -ItemType File -Path 'database/database.sqlite' | Out-Null
    Write-Host 'Created database/database.sqlite'
}

$env:DB_CONNECTION = 'sqlite'
$env:DB_DATABASE = (Resolve-Path 'database/database.sqlite').Path

& $php artisan key:generate --force
& $php artisan migrate:fresh --seed

Write-Host ''
Write-Host 'Demo database refreshed.'
Write-Host 'Demo accounts password: password'
