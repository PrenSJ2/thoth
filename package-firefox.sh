#!/bin/bash

# Thoth Firefox Extension Packaging Script
# Creates a clean zip file ready for Firefox Add-ons submission

set -e  # Exit on any error

# Configuration
EXTENSION_NAME="thoth-extension-firefox"
VERSION=$(grep '"version"' manifest-firefox.json | sed -E 's/.*"version"[^"]*"([^"]+)".*/\1/')
OUTPUT_DIR="dist"
OUTPUT_FILE="${OUTPUT_DIR}/${EXTENSION_NAME}-v${VERSION}.zip"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Packaging Thoth Firefox Extension v${VERSION}${NC}"
echo ""

# Create dist directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Remove old package if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}Removing old package...${NC}"
    rm "$OUTPUT_FILE"
fi

# Files to include in the package
# Only include files required for Firefox Add-ons
FILES=(
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "icon.png"
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
echo -e "${BLUE}Creating Firefox package with manifest-firefox.json...${NC}"

# Create a temporary directory for Firefox files
TEMP_DIR="${OUTPUT_DIR}/firefox-temp"
mkdir -p "$TEMP_DIR"

# Copy manifest as manifest.json
cp manifest-firefox.json "$TEMP_DIR/manifest.json"

# Copy all other files
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$TEMP_DIR/"
    fi
done

# Create zip from temp directory
cd "$TEMP_DIR"
zip -q -r "../../${OUTPUT_FILE}" . -x ".thoth-images/*"
cd ../..

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Get file size
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo -e "${GREEN}✓ Firefox package created successfully!${NC}"
echo -e "  File: ${OUTPUT_FILE}"
echo -e "  Size: ${SIZE}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the extension in Firefox by loading it as a temporary add-on"
echo "  2. Go to about:debugging#/runtime/this-firefox"
echo "  3. Click 'Load Temporary Add-on' and select manifest-firefox.json"
echo "  4. Upload ${OUTPUT_FILE} to Firefox Add-ons Developer Hub"
echo ""
