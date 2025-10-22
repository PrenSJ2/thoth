# Privacy Policy for Thoth Chrome Extension

**Last Updated**: October 22, 2025
**Effective Date**: October 22, 2025

## Introduction

Thoth ("we", "our", or "the extension") is a Chrome browser extension that helps users create GitHub issues using AI. This privacy policy explains how we handle your information.

**TL;DR**: We don't collect, store, or transmit any of your data. Your API keys stay on your device. We have no servers, no analytics, no tracking.

## Information We Collect

### What We Do NOT Collect

- ❌ We do not collect personal information
- ❌ We do not track your browsing history
- ❌ We do not store your GitHub issues
- ❌ We do not analyze your usage patterns
- ❌ We do not use analytics or tracking tools
- ❌ We do not sell any data (because we don't have any)
- ❌ We do not share information with third parties (except as described below)

### What You Provide

**API Keys** (stored locally on your device):
- OpenAI API Key
- GitHub Personal Access Token

**GitHub Repository Information** (stored locally):
- Repository names you select
- Organization/user sources you enable

**Content You Create**:
- Text you copy or select
- Images you choose to include in issues

All of this information is stored **locally in your browser** using Chrome's secure storage API. It never reaches our servers because **we don't have any servers**.

## How We Use Your Information

### Local Storage

Your API keys and repository preferences are stored using Chrome's `chrome.storage.sync` API, which:
- Encrypts data at rest
- Syncs across your Chrome browsers (if you're signed into Chrome)
- Is only accessible by the Thoth extension
- Is never sent to us or any third party

### Third-Party Services

When you create an issue, your data is sent directly from your browser to:

**1. OpenAI API** (for AI-generated issue content)
- **What we send**: The text/image content you selected, page URL, and repository templates
- **Their privacy policy**: https://openai.com/policies/privacy-policy
- **Data processing**: OpenAI processes your content to generate issue titles and descriptions
- **Data retention**: See OpenAI's privacy policy for their data retention practices
- **Your control**: You provide your own API key, so you control your OpenAI account

**2. GitHub API** (for creating issues)
- **What we send**: Issue title, body, and repository information
- **Their privacy policy**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
- **Data processing**: GitHub creates issues in your selected repositories
- **Data retention**: Issues remain in your GitHub repositories until you delete them
- **Your control**: You provide your own Personal Access Token

**Important**: We do not act as an intermediary. Your data goes directly from your browser to OpenAI and GitHub. We never see, store, or process your data.

## Data Security

### How Your API Keys Are Protected

- Stored using Chrome's secure storage API
- Encrypted by Chrome's built-in encryption
- Only accessible by the Thoth extension
- Never transmitted to any server we control
- Can be deleted at any time by uninstalling the extension

### Permissions Explained

The extension requests these Chrome permissions:

- **`storage`**: Store your API keys and preferences locally
- **`activeTab`**: Access the current tab only when you trigger the extension
- **`contextMenus`**: Add right-click menu items
- **`scripting`**: Inject code to capture selected text
- **`notifications`**: Show status notifications
- **`clipboardRead`**: Read clipboard content for quick actions
- **Host permissions** (`https://api.openai.com/*`, `https://api.github.com/*`, `<all_urls>`):
  - Required to communicate with OpenAI and GitHub APIs
  - `<all_urls>` allows the context menu to work on any website

We only access websites when you explicitly trigger the extension (by clicking the icon or using the context menu).

## Your Rights and Choices

### Access and Deletion

- **View your data**: Open the extension popup to see your stored repositories and settings
- **Delete your data**: Uninstall the extension to remove all stored data
- **Modify your data**: Update API keys and repository preferences in the extension popup

### API Key Management

- You control your OpenAI and GitHub API keys
- You can revoke these keys at any time through OpenAI and GitHub
- Revoking keys will stop the extension from working until you provide new ones

### Data Portability

Since all data is stored locally in your browser, you already have full access to it. Chrome's sync functionality handles syncing across your devices.

## Children's Privacy

Thoth is not intended for use by children under 13. We do not knowingly collect information from children. If you believe a child has used this extension, please contact us.

## Open Source

Thoth is open source. You can review the code to verify our privacy practices:
- **GitHub Repository**: https://github.com/yourusername/thoth
- **Source Code**: All code is available for inspection
- **No Hidden Code**: The version on Chrome Web Store matches the public repository

## Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date at the top of this policy
- Posting a notice in the extension's update notes
- For material changes, requiring your consent before the extension continues to function

## Third-Party Privacy Policies

Your use of this extension is also governed by the privacy policies of:
- **OpenAI**: https://openai.com/policies/privacy-policy
- **GitHub**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
- **Chrome Web Store**: https://www.google.com/chrome/privacy/

We encourage you to review these policies.

## International Data Transfers

Since the extension communicates directly with OpenAI and GitHub:
- Your data may be processed in the United States or other countries where these services operate
- This is governed by OpenAI and GitHub's privacy policies, not ours
- We do not control or participate in these data transfers

## GDPR Compliance (European Users)

If you are located in the European Economic Area (EEA), you have certain data protection rights:

**Legal Basis for Processing**:
- **Consent**: By using the extension, you consent to data processing by OpenAI and GitHub
- **Legitimate Interest**: We have a legitimate interest in providing the extension's functionality

**Your GDPR Rights**:
- **Right to Access**: You can view all data stored by the extension
- **Right to Erasure**: Uninstall the extension to delete all data
- **Right to Rectification**: Modify your API keys and settings in the extension
- **Right to Data Portability**: Your data is already in your possession (local storage)
- **Right to Object**: You can stop using the extension at any time
- **Right to Lodge a Complaint**: Contact your local data protection authority

**Data Controller**: For data processed by OpenAI and GitHub, they are the data controllers. For data stored locally by the extension, you are the data controller.

## California Privacy Rights (CCPA)

If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):

We do not:
- Sell your personal information
- Collect personal information (as defined by CCPA)
- Share personal information for business purposes

Since we don't collect data, CCPA rights to access, delete, and opt-out are not applicable in the traditional sense. However, you can always uninstall the extension to remove all local data.

## Contact Us

If you have questions about this privacy policy or the extension:

**Email**: support@ancientbots.com
**GitHub Issues**: https://github.com/yourusername/thoth/issues
**Website**: https://ancientbots.com

For issues related to:
- **OpenAI data processing**: Contact OpenAI support
- **GitHub data processing**: Contact GitHub support

## Data Breach Notification

In the unlikely event of a data breach affecting the extension:
- We will investigate and notify affected users promptly
- We will notify relevant authorities as required by law

However, please note:
- We do not store your data on any servers
- The only "data" we handle is stored locally on your device
- A breach would likely involve the extension code itself, not your data

## Cookies and Tracking

**We do not use cookies or tracking technologies.**

The extension does not:
- Set cookies
- Use Google Analytics
- Use any tracking pixels
- Collect telemetry data
- Monitor your behavior

## Retention Period

**Local Data**: Stored until you uninstall the extension or clear Chrome's extension storage.

**Data Sent to Third Parties**:
- **OpenAI**: See their data retention policy
- **GitHub**: Issues remain until you delete them
- **We do not retain any data** because we don't receive any

## Automated Decision Making

The extension uses OpenAI's AI to generate issue content, which could be considered automated decision making. However:
- You review the generated content before creating the issue
- You can edit the content before submitting
- You control whether to proceed with issue creation
- No decisions are made without your explicit action

## Consent

By installing and using Thoth:
- You consent to this privacy policy
- You consent to OpenAI processing your content (via your own API key)
- You consent to GitHub receiving your issue data (via your own token)
- You understand that we do not collect or store your data

You can withdraw consent at any time by uninstalling the extension.

---

## Summary

**In plain English:**

1. **We don't have your data** - Everything is local to your browser
2. **We don't want your data** - We have no servers, no database, no collection
3. **You control everything** - Your API keys, your content, your choice
4. **It's open source** - You can verify everything we say by reading the code
5. **Third parties** - OpenAI and GitHub receive data directly from you, not through us

**Questions?** Email support@ancientbots.com or open a GitHub issue.

---

**Ancient Bots**
Building tools for developers, respecting privacy by default.

