.PHONY: package clean install help

# Default target
help:
	@echo "Thoth Chrome Extension - Available Commands:"
	@echo ""
	@echo "  make package         - Package the extension locally for testing"
	@echo "  make clean           - Remove build artifacts and old packages"
	@echo "  make help            - Show this help message"
	@echo ""
	@echo "Releases:"
	@echo "  Every push to 'main' automatically:"
	@echo "  - Auto-increments the patch version (e.g., 1.0.0 → 1.0.1)"
	@echo "  - Packages the extension"
	@echo "  - Creates a GitHub release with the new version"
	@echo ""
	@echo "For major/minor version bumps, manually update manifest.json before pushing."
	@echo ""

# Package the extension locally
package: install
	@./package.sh

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/
	@rm -f thoth-extension.zip
	@echo "✓ Clean complete"

# Make package script executable
install:
	@chmod +x package.sh
