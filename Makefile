.PHONY: package clean install release help

# Default target
help:
	@echo "Thoth Chrome Extension - Available Commands:"
	@echo ""
	@echo "  make package         - Package the extension locally for testing"
	@echo "  make release VERSION=x.y.z - Create and push a release tag"
	@echo "  make clean           - Remove build artifacts and old packages"
	@echo "  make help            - Show this help message"
	@echo ""

# Package the extension locally
package: install
	@./package.sh

# Create and push a release tag (triggers GitHub Action)
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Error: VERSION is required. Usage: make release VERSION=1.0.0"; \
		exit 1; \
	fi
	@echo "📋 Verifying manifest.json version..."
	@MANIFEST_VERSION=$$(grep -o '"version"[^"]*"[^"]*"' manifest.json | grep -o '[0-9.]*'); \
	if [ "$$MANIFEST_VERSION" != "$(VERSION)" ]; then \
		echo "❌ Error: manifest.json version ($$MANIFEST_VERSION) does not match specified version ($(VERSION))"; \
		echo "   Please update manifest.json first"; \
		exit 1; \
	fi
	@echo "✓ Version match confirmed: $(VERSION)"
	@echo ""
	@echo "🏷️  Creating release tag v$(VERSION)..."
	@git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@echo "✓ Tag created"
	@echo ""
	@echo "🚀 Pushing tag to GitHub..."
	@git push origin "v$(VERSION)"
	@echo ""
	@echo "✓ Release tag pushed! GitHub Action will build and publish the release."
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
