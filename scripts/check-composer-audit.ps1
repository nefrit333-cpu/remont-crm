param(
    [int] $TimeoutSeconds = 15
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
. (Join-Path $PSScriptRoot 'lib.ps1')

$advisoryUrl = 'https://packagist.org/api/security-advisories/'
$apiAvailable = $false
$apiStatus = 'unavailable'
$auditStatus = 'not-run'
$auditExitCode = $null
$auditOutput = ''

try {
    $php = Resolve-PhpExecutable
    $composer = Resolve-ComposerPhar
} catch {
    Write-Host 'Composer audit monitor'
    Write-Host "advisory API: not checked"
    Write-Host "composer audit: error"
    Write-Host "recommendation: fix local PHP/Composer environment first"
    Write-Host ''
    Write-Host $_.Exception.Message
    exit 3
}

try {
    $response = Invoke-WebRequest -Uri $advisoryUrl -Method Head -TimeoutSec $TimeoutSeconds -UseBasicParsing
    $apiAvailable = $true
    $apiStatus = "available (HTTP $($response.StatusCode))"
} catch {
    if ($_.Exception.Response) {
        $statusCode = [int] $_.Exception.Response.StatusCode
        $apiAvailable = $true
        $apiStatus = "available (HTTP $statusCode)"
    } else {
        $apiStatus = "unavailable ($($_.Exception.Message))"
    }
}

if ($apiAvailable) {
    $processStartInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $processStartInfo.FileName = $php
    $processStartInfo.Arguments = "`"$composer`" audit --no-interaction"
    $processStartInfo.RedirectStandardOutput = $true
    $processStartInfo.RedirectStandardError = $true
    $processStartInfo.UseShellExecute = $false
    $processStartInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $processStartInfo
    [void] $process.Start()
    $standardOutput = $process.StandardOutput.ReadToEnd()
    $standardError = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $auditExitCode = $process.ExitCode
    $auditOutput = (($standardOutput, $standardError) -join [Environment]::NewLine).Trim()

    if ($auditExitCode -eq 0) {
        $auditStatus = 'clean'
    } elseif ($auditOutput -match 'curl error 28|timed out|timeout|Connection timed out') {
        $auditStatus = 'timeout'
    } elseif ($auditOutput -match 'Found \d+ security vulnerability advisories|Found \d+ security vulnerability advisory') {
        $auditStatus = 'advisories'
    } else {
        $auditStatus = 'error'
    }
} else {
    $auditStatus = 'timeout'
}

if ($apiAvailable -and $auditStatus -eq 'timeout') {
    $apiStatus = "unstable ($apiStatus; composer audit timeout)"
}

Write-Host 'Composer audit monitor'
Write-Host "advisory API: $apiStatus"
Write-Host "composer audit: $auditStatus"

switch ($auditStatus) {
    'clean' {
        Write-Host 'recommendation: Composer audit is clean; public release can be prepared as a separate step.'
    }
    'advisories' {
        Write-Host 'recommendation: advisory API is available; proceed to targeted Composer dependency updates.'
    }
    'timeout' {
        Write-Host 'recommendation: retry later; do not change dependencies while audit cannot be verified.'
    }
    default {
        Write-Host 'recommendation: inspect Composer output before changing dependencies.'
    }
}

if ($auditOutput) {
    Write-Host ''
    Write-Host 'Composer output:'
    Write-Host $auditOutput
}

if (-not $apiAvailable -or $auditStatus -eq 'timeout') {
    exit 2
}

if ($auditStatus -eq 'clean') {
    exit 0
}

if ($auditStatus -eq 'advisories') {
    exit 1
}

exit 3
