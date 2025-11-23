# Reorganize Project Files Script
# Moves documentation and scripts to organized folders

$rootPath = "D:\Business\Self car web"

# Move documentation files to docs folder
$docFiles = @(
    "ADVANCED_TESTING_GUIDE.md",
    "ARCHITECTURE.md",
    "BACKEND_TEST_FIX_COMPLETE.md",
    "BACKEND_TEST_FIXES_FINAL.md",
    "BACKEND_TEST_FIXES.md",
    "BACKEND_TESTING_FIXED.md",
    "DEVELOPMENT_CHECKLIST.md",
    "FIXES_SUMMARY.md",
    "HARD_INTEGRATION_TESTING.md",
    "INDEX.md",
    "OAUTH2_IMPLEMENTATION.md",
    "OAUTH2_SETUP.md",
    "PHASE3_IMPLEMENTATION.md",
    "PHASE4_IMPLEMENTATION.md",
    "PROJECT_STRUCTURE.md",
    "PROJECT_SUMMARY.md",
    "QUICK_START.md",
    "README-SCRIPTS.md",
    "SETUP_GUIDE.md",
    "START_HERE.md",
    "START-HERE.md",
    "TESTING_IMPROVEMENTS_SUMMARY.md",
    "TESTING_IMPROVEMENTS.md",
    "UNUSED_IMPORTS_FIX_ROADMAP.md",
    "WEBMVC_TEST_FIX.md",
    "ROADMAP-RUN.md"
)

foreach ($file in $docFiles) {
    $sourcePath = Join-Path $rootPath $file
    $docsPath = Join-Path $rootPath "docs"
    $destPath = Join-Path $docsPath $file
    if (Test-Path $sourcePath) {
        if (-not (Test-Path $destPath)) {
            Move-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "Moved: $file -> docs/$file"
        } else {
            Write-Host "Skipped: $file (already exists in docs)"
        }
    }
}

# Move script files to scripts folder
$scriptFiles = @(
    "check-status.ps1",
    "fix-frontend.ps1",
    "run-advanced-tests.ps1",
    "run-all.ps1",
    "run-backend-tests.ps1",
    "run-backend.ps1",
    "run-frontend-tests.ps1",
    "run-frontend.ps1",
    "run-hard-integration-tests.ps1",
    "run-project.ps1",
    "run-tests-then-start.ps1",
    "run-tests-with-coverage.ps1",
    "run-tests.ps1",
    "run-without-tests.ps1",
    "test-login.ps1"
)

foreach ($file in $scriptFiles) {
    $sourcePath = Join-Path $rootPath $file
    $scriptsPath = Join-Path $rootPath "scripts"
    $destPath = Join-Path $scriptsPath $file
    if (Test-Path $sourcePath) {
        if (-not (Test-Path $destPath)) {
            Move-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "Moved: $file -> scripts/$file"
        } else {
            Write-Host "Skipped: $file (already exists in scripts)"
        }
    }
}

Write-Host "`nReorganization complete!"
Write-Host "Documentation files moved to: docs/"
Write-Host "Script files moved to: scripts/"

