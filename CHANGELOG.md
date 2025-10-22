# Changelog

All notable changes to the Thoth Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflow for automated releases
- Makefile command for creating releases
- CHANGELOG.md for tracking changes

### Fixed
- Service worker crash when context menu is clicked after worker restart

## [1.0.0] - 2025-10-22

### Added
- Initial release of Thoth Chrome Extension
- Text selection to GitHub issue creation
- Image capture to GitHub issue creation
- Combined text and image capture
- AI-powered issue generation using OpenAI GPT-4o-mini
- Issue template detection and integration
- Multi-repository support with organization filtering
- Source-based repository filtering
- Context menu integration
- Automatic issue opening in new tab
- Secure API key storage
- Egyptian-themed branding and UI

### Features
- OpenAI API integration for intelligent issue generation
- GitHub API integration for issue creation
- Dynamic context menu based on selected repositories
- Repository source management (user/organization filtering)
- Issue template auto-detection from repositories
- On-page loading indicators
- Chrome notifications for status updates
- Automatic image URL inclusion in issue body
