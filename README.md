# 📜 Thoth

**The AI scribe that records what matters.**

Thoth is a Chrome extension that captures text and images from any webpage and automatically creates GitHub issues using AI.

## ✨ Features

- 🎯 **Smart Capture**: Highlight text, right-click images, or use clipboard
- 🤖 **AI-Powered**: GPT-4o-mini generates structured issue titles and descriptions
- 📋 **Template Support**: Automatically detects and uses repository issue templates
- 🏢 **Multi-Repository**: Works with personal and organization repositories
- 🖼️ **Image Support**: Captures and embeds images in issues
- ⚡ **Quick Access**: Right-click context menu or popup for blocked sites

## 🚀 Quick Start

### Installation

1. Clone this repository or [download from Chrome Web Store](#)
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `thoth` folder

### Setup

1. Click the Thoth extension icon
2. Add your API keys:
   - **OpenAI API Key**: [Get one here](https://platform.openai.com/api-keys)
   - **GitHub Token**: [Generate here](https://github.com/settings/tokens/new?description=Thoth&scopes=repo,read:org) (requires `repo` and `read:org` scopes)
3. Click **Load Organizations & User**
4. Select which sources to include

### Usage

**From anywhere (clipboard method)**:
1. Copy text (Ctrl+C or Cmd+C)
2. Click Thoth icon → **Create Issue from Clipboard**
3. Select repository → Create

**From webpage (context menu)**:
1. Highlight text or right-click an image
2. Right-click → **Create GitHub Issue with AI**
3. Select repository

The extension will generate an issue title and description, create the issue, and open it in a new tab.

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| No API keys warning | Add OpenAI and GitHub keys in extension popup |
| No repositories showing | Check token scopes (`repo`, `read:org`) and select sources |
| Context menu missing | Load sources and reload the webpage |
| Issue creation fails | Verify repository write access and API quotas |

For detailed troubleshooting, check the browser console (F12).

## 🔒 Privacy & Security

- API keys stored securely in Chrome's encrypted sync storage
- No data collection - only communicates with OpenAI and GitHub APIs
- All processing happens locally in your browser
- See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) and [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md)

## 🔧 Development

### Local Testing

```bash
make package  # Creates dist/thoth-extension-v{version}.zip
make clean    # Remove build artifacts
```

### Releasing

Push to `main` branch - GitHub Actions automatically:
- Increments version
- Creates release
- Uploads to Chrome Web Store

See [CHROME_WEB_STORE_SETUP.md](./CHROME_WEB_STORE_SETUP.md) for detailed publishing setup.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📁 Key Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker (API calls, issue creation)
- `content.js` - Content script (selection capture)
- `popup.html/js` - Extension UI

## 📚 Documentation

- [Chrome Web Store Setup](./CHROME_WEB_STORE_SETUP.md) - Publishing automation
- [Privacy Policy](./PRIVACY_POLICY.md) - Data handling
- [Terms of Service](./TERMS_OF_SERVICE.md) - Usage terms

## 📜 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Thoth** - Named after the ancient Egyptian god of writing, knowledge, and wisdom.

Built with ❤️ for [Ancient Bots](https://github.com/PrenSJ2)
