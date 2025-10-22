# 📜 Thoth

**The AI scribe that records what matters.**

Thoth is a Chrome extension that lets you highlight text or images on any webpage, use AI to summarize or evaluate the content, and automatically create a GitHub issue in your chosen repository.

---

## 🎯 Features

- **Smart Selection**: Highlight text or right-click images on any webpage
- **Combined Content**: Capture both text and images together in a single issue
- **AI-Powered**: Uses OpenAI GPT-4o-mini to generate structured issue titles and descriptions
- **Issue Template Support**: Automatically detects and uses repository issue templates
- **Auto-Open Issues**: Automatically opens created issues in a new tab
- **Multi-Repository Support**: Works with both personal and organization GitHub repositories
- **Source Filtering**: Select which users/organizations to include for cleaner repository lists
- **Context Menu Integration**: Quick access via right-click context menu
- **Secure Storage**: API keys stored securely in Chrome's sync storage
- **Clean UI**: Minimal interface with Egyptian-themed branding (cream, teal, orange, gold)

---

## 📋 Prerequisites

Before installing Thoth, you'll need:

1. **OpenAI API Key**
   - [Create a new API key](https://platform.openai.com/api-keys)
   - Sign up at [platform.openai.com](https://platform.openai.com) if you don't have an account
   - Click "Create new secret key" and give it a name (e.g., "Thoth Extension")
   - Copy the key immediately (starts with `sk-`) - you won't be able to see it again

2. **GitHub Personal Access Token (PAT)**
   - [Generate a new token with pre-filled settings](https://github.com/settings/tokens/new?description=Thoth%20Chrome%20Extension&scopes=repo,read:org)
   - Or manually go to [github.com/settings/tokens](https://github.com/settings/tokens) → "Generate new token (classic)"
   - Required scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)
   - Click "Generate token" and copy it immediately (starts with `ghp_` or `github_pat_`)

---

## 🚀 Installation

### Step 1: Load the Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `thoth` folder
6. The Thoth icon should appear in your extensions toolbar

### Step 2: Configure API Keys

1. Click the Thoth extension icon in your toolbar
2. Enter your **OpenAI API Key** in the first field
3. Enter your **GitHub Personal Access Token** in the second field
4. Click **Save Keys**
5. You should see a success message

### Step 3: Select Repository Sources

1. In the Thoth popup, click **Load Organizations & User**
2. Thoth will load all your accessible sources (your user account + organizations)
3. Check the boxes next to the sources you want to include:
   - Sources labeled `USER` are your personal account
   - Sources labeled `ORG` are organizations you belong to
4. Repositories from selected sources will automatically load and appear in the context menu
5. You can check/uncheck sources at any time to filter which repositories are available

---

## 📖 Usage

### Creating an Issue from Selected Text

1. **Highlight text** on any webpage that you want to capture
2. **Right-click** the selected text
3. Navigate to **"Create GitHub Issue with AI"**
4. Select the repository where you want to create the issue from the submenu
   - Only repositories from your selected sources will appear
5. Thoth will:
   - Check if the repository has an issue template
   - Send the selected text to OpenAI
   - Generate a structured issue title and description (using the template if available)
   - Create the issue in your chosen GitHub repository
   - Open the issue in a new tab automatically
   - Show a success notification

**Note**: If your repository has issue templates, Thoth will automatically detect and use them to structure the generated issue content.

### Creating an Issue from an Image

1. **Right-click** any image on a webpage
2. Navigate to **"Create GitHub Issue with AI"**
3. Select the repository where you want to create the issue
4. Thoth will:
   - Check if the repository has an issue template
   - Capture the image URL
   - Send it to OpenAI with context
   - Generate an issue with the image embedded (using the template if available)
   - Create the issue in GitHub
   - Open the issue in a new tab automatically
   - Show a success notification

### Creating an Issue with Both Text and Image

1. **Highlight text** on the webpage
2. **Right-click** on an image while the text is still selected
3. Navigate to **"Create GitHub Issue with AI"**
4. Select the repository where you want to create the issue
5. Thoth will:
   - Capture both the selected text and the image URL
   - Send both to OpenAI with context
   - Generate an issue that includes both the text content and the embedded image
   - Create the issue in GitHub
   - Open the issue in a new tab automatically
   - Show a success notification

**Tip**: This is perfect for capturing bug reports with screenshots, feature requests with mockups, or any content that needs both textual and visual context!

---

## 🎨 Branding

Thoth features an Egyptian-themed design inspired by the god of wisdom:

- **Background**: Light Papyrus (`#faf8f0`)
- **Primary**: Dark Teal (`#16a085`) - for primary actions and links
- **Accent**: Burnt Orange (`#d45f13`) - for headers and highlights
- **Secondary**: Gold (`#d4a03a`) - for secondary actions
- **Text**: Deep Navy (`#1a1a2e`) - for primary text with high contrast
- **Typography**: System fonts with clean, minimal styling and enhanced readability
- **Icon**: Egyptian ibis holding a scroll, representing Thoth's sacred animal

---

## 🔒 Security & Privacy

- **API Keys**: Stored securely in Chrome's sync storage (encrypted and synced across devices)
- **No Data Collection**: Thoth does not collect or transmit any data except to OpenAI and GitHub APIs
- **Local Processing**: All extension logic runs locally in your browser
- **Permissions**:
  - `contextMenus`: Add right-click menu items
  - `storage`: Save API keys and preferences
  - `activeTab`: Access current tab content when triggered
  - `scripting`: Inject content script for selection capture
  - `notifications`: Show status notifications

---

## 🛠️ Troubleshooting

### "Setup Required" Notification

**Problem**: You see a notification saying "Please configure your API keys"

**Solution**: Open the Thoth popup and save your OpenAI and GitHub API keys

### No Sources or Repositories Showing

**Problem**: No sources appear after clicking "Load Organizations & User" or no repositories in context menu

**Solution**:
- Verify your GitHub token has the correct scopes (`repo`, `read:org`)
- Make sure you've selected at least one source checkbox in the popup
- Check the repo count message at the bottom of the sources section
- Try refreshing sources by clicking "Refresh Sources"
- Open the browser console (F12) and check for error messages

### "Failed to create issue" Error

**Problem**: Issue creation fails with an error notification

**Solution**:
- Verify you have write access to the selected repository
- Check that both API keys are valid and not expired
- Ensure you have remaining quota on your OpenAI account
- Check the browser console for detailed error messages

### Context Menu Not Appearing

**Problem**: Right-click menu doesn't show "Create GitHub Issue with AI"

**Solution**:
- Make sure you've loaded sources and selected at least one source
- Verify that repositories have been loaded (check repo count in popup)
- Reload the extension: go to `chrome://extensions/`, find Thoth, and click the refresh icon
- Try reloading the webpage you're working on

---

## 📁 Project Structure

```
thoth/
├── .github/
│   └── workflows/
│       └── release.yml     # GitHub Action for automated releases
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js           # Service worker: context menus, API calls, issue creation
├── content.js              # Content script: captures selections and images
├── popup.html              # Extension popup UI layout
├── popup.js                # Popup logic: settings, repo management
├── icon.png                # Extension icon (128×128)
├── package.sh              # Packaging script for local testing
├── Makefile                # Build automation and release management
└── README.md               # This file
```

---

## 🔧 Development

### Building & Packaging

#### Local Testing

To package the extension locally for testing:

```bash
# Package the extension (creates dist/thoth-extension-v{version}.zip)
make package

# Clean build artifacts
make clean
```

#### Creating a Release

Releases are automated via GitHub Actions. To create a new release:

1. **Update the version** in `manifest.json`:
   ```json
   {
     "version": "1.2.0"
   }
   ```

2. **Commit the change**:
   ```bash
   git add manifest.json
   git commit -m "Bump version to 1.2.0"
   git push
   ```

3. **Create and push the release tag**:
   ```bash
   make release VERSION=1.2.0
   ```

The GitHub Action will automatically:
- Verify the manifest version matches the tag
- Package the extension
- Generate a changelog from commits
- Create a GitHub release with release notes
- Upload the `.zip` file as a downloadable asset

**View releases:** [GitHub Releases](../../releases)

#### Manual Release (if needed)

If you need to create a tag manually:

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### File Responsibilities

- **manifest.json**: Defines extension metadata, permissions, and entry points
- **background.js**: Service worker that handles:
  - Dynamic context menu creation
  - Issue template detection and fetching
  - OpenAI API calls for issue generation
  - GitHub API calls for issue creation
  - Chrome notifications
- **content.js**: Injected into web pages to capture selections and track right-clicked elements
- **popup.html/popup.js**: Extension settings interface for:
  - API key management
  - Organization and user source selection
  - Repository filtering via source checkboxes

### API Endpoints Used

**OpenAI**:
- `POST https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini`

**GitHub**:
- `GET https://api.github.com/user` (fetch current user)
- `GET https://api.github.com/user/orgs` (fetch organizations)
- `GET https://api.github.com/users/{user}/repos?per_page=100` (fetch user repositories)
- `GET https://api.github.com/orgs/{org}/repos?per_page=100` (fetch org repositories)
- `GET https://api.github.com/repos/{owner}/{repo}/contents/{path}` (for issue templates)
- `POST https://api.github.com/repos/{owner}/{repo}/issues` (create issue)

### Issue Template Detection

Thoth automatically checks for issue templates in the following locations (in order):
1. `.github/ISSUE_TEMPLATE.md`
2. `.github/ISSUE_TEMPLATE/bug_report.md`
3. `.github/ISSUE_TEMPLATE/feature_request.md`
4. `ISSUE_TEMPLATE.md`
5. `.github/issue_template.md`

When a template is found, the AI uses it to structure the generated issue content, filling in sections and placeholders with relevant information from your selected content.

---

## 🤝 Contributing

This is a production-ready Chrome extension. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Chrome
5. Submit a pull request

---

## 📜 License

This project is provided as-is for the Ancient Bots team.

---

## ✨ Credits

**Thoth** - Named after the ancient Egyptian god of writing, knowledge, and wisdom. Just as Thoth recorded the deeds of the gods, this extension records what matters on the web.

Built with ❤️ for Ancient Bots.

---

## 📞 Support

For issues, questions, or feature requests:
- Check the Troubleshooting section above
- Review the browser console for error messages
- Verify your API keys are valid and have the correct scopes

---

**Version**: 1.0.0
**Manifest**: V3
**Minimum Chrome Version**: 88+
