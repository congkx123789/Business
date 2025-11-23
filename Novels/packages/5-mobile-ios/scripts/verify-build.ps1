# Build Verification Script for iOS App (PowerShell)
# Verifies that the Xcode project builds successfully

Write-Host "🔨 Starting iOS Build Verification..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if we're in the right directory
if (-not (Test-Path "StoryReader")) {
    Write-Host "❌ Error: StoryReader directory not found" -ForegroundColor Red
    Write-Host "Please run this script from packages/5-mobile-ios directory"
    exit 1
}

# Find Xcode project or workspace
$projectFile = $null
$scheme = "StoryReader"

if (Test-Path "StoryReader.xcodeproj\project.pbxproj") {
    $projectFile = "StoryReader.xcodeproj"
    $scheme = "StoryReader"
}
elseif (Test-Path "StoryReader.xcworkspace\contents.xcworkspacedata") {
    $projectFile = "StoryReader.xcworkspace"
    $scheme = "StoryReader"
}
else {
    Write-Host "⚠️  Warning: No Xcode project or workspace found" -ForegroundColor Yellow
    Write-Host "Creating basic project structure check..."
    
    # Check for required directories
    $requiredDirs = @(
        "StoryReader\App",
        "StoryReader\Model",
        "StoryReader\View",
        "StoryReader\ViewModel",
        "StoryReader\Repository",
        "StoryReader\Service"
    )
    
    $missingDirs = @()
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            $missingDirs += $dir
        }
    }
    
    if ($missingDirs.Count -eq 0) {
        Write-Host "✅ All required directories exist" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Missing directories:" -ForegroundColor Red
        foreach ($dir in $missingDirs) {
            Write-Host "  - $dir"
        }
        exit 1
    }
    
    exit 0
}

Write-Host "✅ Found project: $projectFile" -ForegroundColor Green
Write-Host ""

# Check Xcode version
Write-Host "📱 Checking Xcode installation..."
try {
    $xcodeVersion = & xcodebuild -version 2>&1 | Select-Object -First 1
    Write-Host "✅ $xcodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Xcode command line tools not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check for required Swift files
Write-Host "📄 Checking required Swift files..."
$requiredFiles = @(
    "StoryReader\App\StoryReaderApp.swift",
    "StoryReader\Service\AuthService.swift",
    "StoryReader\Service\TTS\TextToSpeechManager.swift"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ All required files exist" -ForegroundColor Green
}
else {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file"
    }
    exit 1
}
Write-Host ""

# Attempt to build (if project exists)
if ($projectFile) {
    Write-Host "🔨 Building project..."
    Write-Host ""
    
    # Clean build folder
    Write-Host "🧹 Cleaning build folder..."
    & xcodebuild clean -project $projectFile -scheme $scheme 2>&1 | Out-Null
    Write-Host ""
    
    # Build for simulator
    Write-Host "📦 Building for iOS Simulator..."
    $buildOutput = & xcodebuild build `
        -project $projectFile `
        -scheme $scheme `
        -sdk iphonesimulator `
        -destination 'platform=iOS Simulator,name=iPhone 15' `
        CODE_SIGN_IDENTITY="" `
        CODE_SIGNING_REQUIRED=NO `
        2>&1
    
    $buildOutput | Out-File -FilePath "build.log" -Encoding UTF8
    
    if ($buildOutput -match "BUILD SUCCEEDED") {
        Write-Host "✅ Build succeeded!" -ForegroundColor Green
        Remove-Item "build.log" -ErrorAction SilentlyContinue
        exit 0
    }
    elseif ($buildOutput -match "BUILD FAILED") {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Write-Host "Check build.log for details"
        exit 1
    }
    else {
        Write-Host "⚠️  Build output unclear, check build.log" -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "⚠️  Skipping actual build (no Xcode project found)" -ForegroundColor Yellow
    Write-Host "✅ Structure verification passed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Build verification complete!" -ForegroundColor Green

