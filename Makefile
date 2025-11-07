.PHONY: package clean install help package-firefox package-chrome

# Default target
help:
	@echo "Thoth Extension - Available Commands:"
	@echo ""
	@echo "  make package         - Package both Chrome and Firefox extensions"
	@echo "  make package-chrome  - Package the Chrome extension only"
	@echo "  make package-firefox - Package the Firefox extension only"
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

# Package both Chrome and Firefox extensions
package: install package-chrome package-firefox

# Package the Chrome extension locally
package-chrome: install
	@./package.sh

# Package the Firefox extension locally
package-firefox: install
	@./package-firefox.sh

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/
	@rm -f thoth-extension.zip
	@echo "✓ Clean complete"

# Make package scripts executable
install:
	@chmod +x package.sh
	@chmod +x package-firefox.sh
