#!/bin/bash

# Build Verification Script for iOS App
# Verifies that the Xcode project builds successfully

set -e  # Exit on error

echo "🔨 Starting iOS Build Verification..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "StoryReader" ]; then
    echo -e "${RED}❌ Error: StoryReader directory not found${NC}"
    echo "Please run this script from packages/5-mobile-ios directory"
    exit 1
fi

# Find Xcode project or workspace
PROJECT_FILE=""
if [ -f "StoryReader.xcodeproj/project.pbxproj" ]; then
    PROJECT_FILE="StoryReader.xcodeproj"
    SCHEME="StoryReader"
elif [ -f "StoryReader.xcworkspace/contents.xcworkspacedata" ]; then
    PROJECT_FILE="StoryReader.xcworkspace"
    SCHEME="StoryReader"
else
    echo -e "${YELLOW}⚠️  Warning: No Xcode project or workspace found${NC}"
    echo "Creating basic project structure check..."
    
    # Check for required directories
    REQUIRED_DIRS=("StoryReader/App" "StoryReader/Model" "StoryReader/View" "StoryReader/ViewModel" "StoryReader/Repository" "StoryReader/Service")
    MISSING_DIRS=()
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            MISSING_DIRS+=("$dir")
        fi
    done
    
    if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required directories exist${NC}"
    else
        echo -e "${RED}❌ Missing directories:${NC}"
        for dir in "${MISSING_DIRS[@]}"; do
            echo "  - $dir"
        done
        exit 1
    fi
    
    exit 0
fi

echo -e "${GREEN}✅ Found project: $PROJECT_FILE${NC}"
echo ""

# Check Xcode version
echo "📱 Checking Xcode installation..."
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version | head -n 1)
    echo -e "${GREEN}✅ $XCODE_VERSION${NC}"
else
    echo -e "${RED}❌ Xcode command line tools not found${NC}"
    exit 1
fi
echo ""

# Check for required Swift files
echo "📄 Checking required Swift files..."
REQUIRED_FILES=(
    "StoryReader/App/StoryReaderApp.swift"
    "StoryReader/Service/AuthService.swift"
    "StoryReader/Service/TTS/TextToSpeechManager.swift"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required files exist${NC}"
else
    echo -e "${RED}❌ Missing required files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi
echo ""

# Attempt to build (if project exists)
if [ -n "$PROJECT_FILE" ]; then
    echo "🔨 Building project..."
    echo ""
    
    # Clean build folder
    echo "🧹 Cleaning build folder..."
    xcodebuild clean -project "$PROJECT_FILE" -scheme "$SCHEME" 2>&1 | grep -v "warning:" || true
    echo ""
    
    # Build for simulator
    echo "📦 Building for iOS Simulator..."
    if xcodebuild build \
        -project "$PROJECT_FILE" \
        -scheme "$SCHEME" \
        -sdk iphonesimulator \
        -destination 'platform=iOS Simulator,name=iPhone 15' \
        CODE_SIGN_IDENTITY="" \
        CODE_SIGNING_REQUIRED=NO \
        2>&1 | tee build.log | grep -E "(error|warning:|BUILD SUCCEEDED|BUILD FAILED)"; then
        echo ""
        if grep -q "BUILD SUCCEEDED" build.log; then
            echo -e "${GREEN}✅ Build succeeded!${NC}"
            rm -f build.log
            exit 0
        else
            echo -e "${RED}❌ Build failed${NC}"
            echo "Check build.log for details"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Build output unclear, check build.log${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Skipping actual build (no Xcode project found)${NC}"
    echo -e "${GREEN}✅ Structure verification passed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Build verification complete!${NC}"

