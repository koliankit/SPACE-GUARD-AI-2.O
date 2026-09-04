# ==============================================================================
# SPACEGUARD AI - SIH 2026 Judge Submission Packager
# Packages clean code + production build into a ZIP file for judges
# ==============================================================================

$ProjectDir = $PSScriptRoot
$ZipFile = Join-Path $ProjectDir "SPACEGUARD_AI_SIH2026_Submission.zip"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "        Packaging SPACEGUARD AI for Judge Submission & Deployment" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

if (Test-Path $ZipFile) {
    Remove-Item -Force $ZipFile
}

# Temporary packaging folder
$TempDir = Join-Path $env:TEMP "spaceguard_submission_$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host "[*] Copying project files..." -ForegroundColor Yellow

$ExcludeDirs = @('.venv', 'node_modules', '__pycache__', '.pytest_cache', '.git')

Get-ChildItem -Path $ProjectDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($ProjectDir.Length + 1)
    
    # Check if file/dir is in an excluded path
    $skip = $false
    foreach ($ex in $ExcludeDirs) {
        if ($relativePath -match "(^|\\)$([regex]::Escape($ex))(\\|$)" -or $relativePath -match "\.zip$") {
            $skip = $true
            break
        }
    }

    if (-not $skip) {
        $targetPath = Join-Path $TempDir $relativePath
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        } else {
            $parentDir = Split-Path $targetPath
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}

Write-Host "[*] Compressing into $ZipFile..." -ForegroundColor Yellow
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipFile -CompressionLevel Optimal

# Cleanup temp
Remove-Item -Recurse -Force $TempDir

$sizeMB = [math]::Round(((Get-Item $ZipFile).Length / 1MB), 2)
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Submission package created: $ZipFile ($sizeMB MB)" -ForegroundColor Green
Write-Host " Judges can extract this archive and double-click 'run_judge_demo.bat' directly!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
