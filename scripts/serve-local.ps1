param(
    [int] $Port = 8000
)

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

if (-not (Test-Path 'database/database.sqlite')) {
    New-Item -ItemType Directory -Force -Path 'database' | Out-Null
    New-Item -ItemType File -Path 'database/database.sqlite' | Out-Null
    Write-Host 'Created database/database.sqlite'
}

$env:DB_CONNECTION = 'sqlite'
$env:DB_DATABASE = (Resolve-Path 'database/database.sqlite').Path

Write-Host "Starting Remont CRM at http://127.0.0.1:$Port"
& $php artisan serve --host=127.0.0.1 --port=$Port
