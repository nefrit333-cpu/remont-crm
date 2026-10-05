param(
    [switch] $WithOnlineAudit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
. (Join-Path $PSScriptRoot 'lib.ps1')

$php = Resolve-PhpExecutable
$composer = Resolve-ComposerPhar
$npm = Resolve-NpmCommand

function Invoke-Step {
    param(
        [string] $Name,
        [scriptblock] $Command
    )

    Write-Host ''
    Write-Host "==> $Name"
    & $Command
}

Invoke-Step 'Composer config validation' {
    & $php $composer validate --no-check-publish
}

Invoke-Step 'PHP tests' {
    & $php artisan test
}

Invoke-Step 'Pint formatting check' {
    & $php vendor/bin/pint --test
}

Invoke-Step 'Frontend production build' {
    & $npm run build
}

if ($WithOnlineAudit) {
    Invoke-Step 'NPM high severity audit' {
        & $npm audit --audit-level=high
    }

    Invoke-Step 'Composer security audit' {
        & $php $composer audit
    }
} else {
    Write-Host ''
    Write-Host 'Skipped online audits. Run with -WithOnlineAudit when npm registry and Packagist advisory API are stable.'
}

Write-Host ''
Write-Host 'Local checks finished.'
