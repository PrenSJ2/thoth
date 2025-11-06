# Firefox Support

This document explains how Thoth supports both Chrome and Firefox browsers.

## Browser Differences

### Manifest Files

- **Chrome**: Uses `manifest.json` with Manifest V3 (service workers)
- **Firefox**: Uses `manifest-firefox.json` with Manifest V2 (background scripts)

Key differences:
1. **Background Scripts**:
   - Chrome V3: `"service_worker": "background.js"`
   - Firefox V2: `"scripts": ["background.js"]`

2. **Browser Action**:
   - Chrome V3: `"action": {...}`
   - Firefox V2: `"browser_action": {...}`

3. **Host Permissions**:
   - Chrome V3: Separate `"host_permissions"` array
   - Firefox V2: Included in `"permissions"` array

4. **Browser ID**:
   - Firefox requires `"browser_specific_settings"` with a unique extension ID

### Code Compatibility

All JavaScript files (`background.js`, `content.js`, `popup.js`) are compatible with both browsers out of the box because:

1. **Firefox supports the `chrome` namespace**: Firefox's WebExtensions API implements the `chrome.*` APIs as aliases to `browser.*`, so code using `chrome.storage`, `chrome.tabs`, etc. works in both browsers.

2. **Action API compatibility**: The only API difference is handled via a compatibility constant:
   ```javascript
   // Handle action vs browserAction API differences (Manifest V3 vs V2)
   const actionAPI = chrome.action || chrome.browserAction;
   ```
   This ensures badge operations work in both browsers without needing separate code paths.

## Building

### Chrome Package
```bash
make package-chrome
```
Creates: `dist/thoth-extension-v{version}.zip`

### Firefox Package
```bash
make package-firefox
```
Creates: `dist/thoth-extension-firefox-v{version}.zip`

### Both Packages
```bash
make package
```
Creates both Chrome and Firefox packages.

## Testing

### Chrome
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the repository folder
5. Uses `manifest.json` automatically

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest-firefox.json` from the repository folder
4. Note: Temporary add-ons are removed when Firefox restarts

## API Compatibility

### Storage API
Both browsers use the same API:
- `chrome.storage.sync` / `browser.storage.sync`
- `chrome.storage.local` / `browser.storage.local`

### Context Menus
Both browsers use the same API:
- `chrome.contextMenus` / `browser.contextMenus`

### Tabs API
Both browsers use the same API:
- `chrome.tabs` / `browser.tabs`

### Scripting API
Chrome V3 uses `chrome.scripting.executeScript()`
Firefox V2 also supports this API.

### Notifications
Both browsers use the same API:
- `chrome.notifications` / `browser.notifications`

## Known Limitations

### Firefox Limitations
1. **Temporary Add-ons**: When loaded via `about:debugging`, the add-on is removed when Firefox restarts. For persistent testing, you need to sign the extension.

2. **Service Workers**: Firefox doesn't fully support Manifest V3 service workers yet, which is why we use Manifest V2.

3. **Badge API**: Firefox's `browserAction.setBadgeText()` has the same API as Chrome's `action.setBadgeText()`, handled via our compatibility layer.

### Chrome Limitations
None specific to this extension.

## Future Improvements

1. **Manifest V3 for Firefox**: Once Firefox fully supports Manifest V3, we can unify the manifests.

2. **Automated Firefox Upload**: Similar to Chrome Web Store automation, add Firefox Add-ons automated upload.

3. **Edge Support**: While Edge uses Chromium and should work with the Chrome manifest, we could add specific Edge packaging if needed.

## Publishing

### Chrome Web Store
1. Build with `make package-chrome`
2. Upload `dist/thoth-extension-v{version}.zip` to Chrome Web Store Developer Dashboard
3. Or use automated GitHub Actions workflow

### Firefox Add-ons
1. Build with `make package-firefox`
2. Upload `dist/thoth-extension-firefox-v{version}.zip` to Firefox Add-ons Developer Hub
3. Sign the extension for distribution
4. Currently manual process (automation pending)

## Troubleshooting

### Firefox: Extension doesn't load
- Ensure you selected `manifest-firefox.json`, not `manifest.json`
- Check the Browser Console (`Ctrl+Shift+J`) for errors
- Verify the extension ID is not conflicting with another extension

### Chrome: Service worker issues
- Check the Service Worker logs in `chrome://extensions/`
- Ensure background.js doesn't have syntax errors
- Restart the extension

### Both: API key storage issues
- Chrome and Firefox use separate storage
- Keys saved in Chrome won't appear in Firefox and vice versa
- Users need to configure keys separately in each browser
