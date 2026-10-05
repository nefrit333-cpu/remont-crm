Set-StrictMode -Version Latest

function Resolve-PhpExecutable {
    $php = Get-Command php -ErrorAction SilentlyContinue

    if ($php) {
        return $php.Source
    }

    $codexTools = Join-Path $env:USERPROFILE 'Documents/Codex'

    if (Test-Path $codexTools) {
        $bundledPhp = Get-ChildItem -Path $codexTools -Filter php.exe -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -like '*\work\tools\php\php.exe' } |
            Sort-Object FullName -Descending |
            Select-Object -First 1

        if ($bundledPhp) {
            return $bundledPhp.FullName
        }
    }

    throw 'PHP executable was not found. Install PHP 8.3+ or make it available in PATH.'
}

function Resolve-ComposerPhar {
    $composer = Get-Command composer -ErrorAction SilentlyContinue

    if ($composer) {
        return $composer.Source
    }

    $codexTools = Join-Path $env:USERPROFILE 'Documents/Codex'

    if (Test-Path $codexTools) {
        $bundledComposer = Get-ChildItem -Path $codexTools -Filter composer.phar -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -like '*\work\tools\composer.phar' } |
            Sort-Object FullName -Descending |
            Select-Object -First 1

        if ($bundledComposer) {
            return $bundledComposer.FullName
        }
    }

    throw 'Composer was not found. Install Composer or make composer.phar available.'
}

function Resolve-NpmCommand {
    $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue

    if ($npmCmd) {
        return $npmCmd.Source
    }

    $npm = Get-Command npm -ErrorAction SilentlyContinue

    if ($npm) {
        return $npm.Source
    }

    throw 'npm was not found. Install Node.js or make npm available in PATH.'
}
