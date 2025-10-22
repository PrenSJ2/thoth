.PHONY: package clean install release help

# Default target
help:
	@echo "Thoth Chrome Extension - Available Commands:"
	@echo ""
	@echo "  make package         - Package the extension locally for testing"
	@echo "  make release VERSION=x.y.z - Bump version, commit, and push to main"
	@echo "                         (triggers automatic GitHub release)"
	@echo "  make clean           - Remove build artifacts and old packages"
	@echo "  make help            - Show this help message"
	@echo ""
	@echo "Note: Every push to 'main' automatically creates a release if the version changed."
	@echo ""

# Package the extension locally
package: install
	@./package.sh

# Update version and push to main (triggers automatic GitHub Action release)
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Error: VERSION is required. Usage: make release VERSION=1.0.0"; \
		exit 1; \
	fi
	@echo "📝 Updating manifest.json to version $(VERSION)..."
	@sed -i '' 's/"version": "[^"]*"/"version": "$(VERSION)"/' manifest.json
	@echo "✓ manifest.json updated"
	@echo ""
	@echo "📋 Committing version bump..."
	@git add manifest.json
	@git commit -m "Bump version to $(VERSION)"
	@echo "✓ Committed"
	@echo ""
	@echo "🚀 Pushing to main..."
	@git push origin main
	@echo ""
	@echo "✓ Pushed to main! GitHub Action will automatically create the release."
	@echo "   View progress at: https://github.com/$$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/
	@rm -f thoth-extension.zip
	@echo "✓ Clean complete"

# Make package script executable
install:
	@chmod +x package.sh
