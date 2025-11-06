# Testing Thoth on Firefox

This guide explains how to test the Thoth extension on Firefox.

## Quick Start

### Option 1: Load Temporary Add-on (Recommended for Testing)

This is the easiest way to test the extension, but the add-on will be removed when Firefox restarts.

1. **Open Firefox Developer Tools**
   - Navigate to: `about:debugging#/runtime/this-firefox`
   - Or: Menu → More tools → Browser Developer Tools → Three dots menu → about:debugging

2. **Load the Extension**
   - Click **"Load Temporary Add-on..."**
   - Navigate to your `thoth` folder
   - Select the file: `manifest-firefox.json`
   - Click "Open"

3. **Verify Installation**
   - You should see "Thoth" listed under "Temporary Extensions"
   - The Thoth icon should appear in your Firefox toolbar
   - If you don't see the icon, click the puzzle piece icon and pin Thoth

4. **Configure API Keys**
   - Click the Thoth icon in the toolbar
   - Add your OpenAI API Key
   - Add your GitHub Token (with `repo` and `read:org` scopes)
   - Click "Load Organizations & User"
   - Select which sources to include

5. **Test the Extension**
   - Go to any webpage
   - Highlight some text
   - Right-click and select "Create GitHub Issue with AI"
   - Choose a repository
   - The extension should create an issue and open it in a new tab

### Option 2: Load from Package (For Distribution Testing)

If you want to test the packaged version:

1. **Build the Firefox Package**
   ```bash
   cd /path/to/thoth
   make package-firefox
   ```
   This creates: `dist/thoth-extension-firefox-v1.0.13.zip`

2. **Install in Firefox**
   - Go to: `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select the ZIP file: `dist/thoth-extension-firefox-v1.0.13.zip`
   - Note: Firefox will extract and load the add-on

## Important Notes

### Temporary Add-ons Limitations

- **Removed on Restart**: Temporary add-ons are removed when Firefox closes
- **No Automatic Updates**: You must reload manually after making changes
- **Settings Persist**: Your API keys and settings are stored in Firefox's storage and persist across reloads

### Reloading After Changes

If you make changes to the code:

1. Go to `about:debugging#/runtime/this-firefox`
2. Find "Thoth" under Temporary Extensions
3. Click "Reload"
4. Your changes will be applied

### Permanent Installation

For permanent installation (survives Firefox restart), you need to:

1. **Sign the Extension**
   - Go to: https://addons.mozilla.org/developers/
   - Create an account if needed
   - Submit the extension for signing
   - Mozilla will review and sign it

2. **Or: Install from Firefox Add-ons**
   - Once published, users can install from: https://addons.mozilla.org/

## Testing Checklist

Test these features to ensure Firefox compatibility:

- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking the icon
- [ ] API keys can be saved and loaded
- [ ] Organizations and repositories load correctly
- [ ] Context menu appears when right-clicking on selected text
- [ ] Context menu appears when right-clicking on images
- [ ] Issues are created successfully from selected text
- [ ] Issues are created successfully from clipboard (popup button)
- [ ] Issues are created successfully with images
- [ ] Created issues open in new tabs
- [ ] Notifications appear for success/error states
- [ ] Loading indicators appear during issue creation
- [ ] Storage persists across reloads (API keys, selected repos)

## Troubleshooting

### Extension doesn't load
- **Error**: "This add-on could not be installed"
  - **Solution**: Make sure you selected `manifest-firefox.json`, not `manifest.json`
  - The Chrome manifest won't work in Firefox

### No context menu
- **Error**: Right-click menu doesn't show "Create GitHub Issue with AI"
  - **Solution**: 
    1. Make sure repositories are loaded (click Thoth icon → Load Organizations & User)
    2. Reload the webpage you're testing on
    3. Verify the extension is enabled in about:debugging

### API keys not saving
- **Error**: Keys disappear after reload
  - **Solution**: 
    1. Firefox temporary add-ons DO save storage data
    2. Check Browser Console (Ctrl+Shift+J) for errors
    3. Verify you clicked "Save" button after entering keys

### Issues not creating
- **Error**: Nothing happens when clicking context menu
  - **Solution**:
    1. Open Browser Console (Ctrl+Shift+J) to see errors
    2. Verify API keys are configured correctly
    3. Check network tab for API failures
    4. Make sure you have write access to the selected repository

### Badge not showing
- **Error**: Loading badge (three dots) doesn't appear
  - **Solution**: This is normal - Firefox's browserAction.setBadgeText has slightly different behavior than Chrome
  - The issue should still create successfully
  - Check for the loading notification instead

## Viewing Logs

### Browser Console
Press `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Shift+J` (Mac) to open the Browser Console and see:
- Background script logs
- API call results
- Error messages

### Extension Debugging
1. Go to `about:debugging#/runtime/this-firefox`
2. Find "Thoth" under Temporary Extensions
3. Click "Inspect" to open the extension debugger
4. This shows:
   - Background script console
   - Network requests
   - Storage contents

## Differences from Chrome

### Manifest Version
- Chrome uses Manifest V3 (service workers)
- Firefox uses Manifest V2 (persistent background scripts)
- Same functionality, different implementation

### Badge Behavior
- Chrome: Badge shows immediately and clearly
- Firefox: Badge might be subtle or delayed
- Both versions work correctly

### Storage
- API keys saved in Firefox are separate from Chrome
- If you use both browsers, configure keys in each

## Next Steps

After testing:

1. **Report Issues**: If you find bugs, report them on GitHub
2. **Provide Feedback**: Let us know what works and what doesn't
3. **Wait for Release**: Once published to Firefox Add-ons, you can install normally

## Publishing to Firefox Add-ons

For developers wanting to publish:

1. Build the Firefox package: `make package-firefox`
2. Go to: https://addons.mozilla.org/developers/
3. Create a developer account
4. Submit the extension
5. Fill in required information:
   - Name: Thoth
   - Summary: AI-powered GitHub issue creator
   - Categories: Developer Tools, Productivity
6. Upload: `dist/thoth-extension-firefox-v1.0.13.zip`
7. Wait for review (usually 1-3 days)
8. Once approved, extension will be available on Firefox Add-ons

## Resources

- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V2 Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
