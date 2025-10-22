.PHONY: package clean install help

# Default target
help:
	@echo "Thoth Chrome Extension - Available Commands:"
	@echo ""
	@echo "  make package    - Package the extension for distribution"
	@echo "  make clean      - Remove build artifacts and old packages"
	@echo "  make install    - Make the package script executable"
	@echo "  make help       - Show this help message"
	@echo ""

# Package the extension
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
