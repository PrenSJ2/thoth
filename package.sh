#!/bin/bash

# Thoth Chrome Extension Packaging Script
# Creates a clean zip file ready for Chrome Web Store submission

set -e  # Exit on any error

# Configuration
EXTENSION_NAME="thoth-extension"
VERSION=$(grep '"version"' manifest.json | sed -E 's/.*"version"[^"]*"([^"]+)".*/\1/')
OUTPUT_DIR="dist"
OUTPUT_FILE="${OUTPUT_DIR}/${EXTENSION_NAME}-v${VERSION}.zip"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Packaging Thoth Chrome Extension v${VERSION}${NC}"
echo ""

# Create dist directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Remove old package if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}Removing old package...${NC}"
    rm "$OUTPUT_FILE"
fi

# Files to include in the package
FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "icon.png"
    "README.md"
    "CHANGELOG.md"
    "PRIVACY_POLICY.md"
    "TERMS_OF_SERVICE.md"
    "LICENSE"
)

# Verify all required files exist
echo -e "${BLUE}Verifying files...${NC}"
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠ Warning: $file not found${NC}"
    else
        echo "  ✓ $file"
    fi
done

echo ""
echo -e "${BLUE}Creating package...${NC}"

# Create the zip file, excluding .thoth-images directory
zip -q "$OUTPUT_FILE" "${FILES[@]}" -x "*.thoth-images/*" -x ".thoth-images/*"

# Get file size
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo -e "${GREEN}✓ Package created successfully!${NC}"
echo -e "  File: ${OUTPUT_FILE}"
echo -e "  Size: ${SIZE}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the extension by loading the unpacked folder in Chrome"
echo "  2. Upload ${OUTPUT_FILE} to Chrome Web Store Developer Dashboard"
echo ""
