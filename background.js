// Thoth Background Service Worker
// Handles context menus, API calls, and issue creation

const PARENT_MENU_ID = 'thoth-parent';
let cachedRepos = [];

// Initialize extension on install/startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Thoth installed');
  buildContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Thoth started');
  buildContextMenu();
});

// Watch for storage changes and rebuild menu
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.reposList) {
    console.log('Repos changed, rebuilding menu');
    buildContextMenu();
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createIssueFromPopup') {
    handlePopupIssueCreation(message.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Fetch image and upload to GitHub repository
async function uploadImageToGitHub(imageUrl, repoFullName, githubToken) {
  try {
    console.log('Fetching image from:', imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return null;
    }

    const blob = await response.blob();
    console.log('Image fetched, size:', Math.round(blob.size / 1024), 'KB, type:', blob.type);

    // Check size limit (GitHub API has 1MB limit for file contents)
    if (blob.size > 1000000) {
      console.error('⚠ Image too large for upload (', Math.round(blob.size / 1024), 'KB). Max: 1MB');
      return null;
    }

    // Generate filename with proper extension
    const timestamp = Date.now();
    const extension = blob.type.split('/')[1] || 'png';
    const filename = `thoth-${timestamp}.${extension}`;
    const path = `.thoth-images/${filename}`;

    // Convert to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('Uploading to repository:', path);

    // Upload to repository contents
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add image for Thoth issue`,
          content: base64
        })
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Failed to upload to repository:', errorText);
      return null;
    }

    const uploadData = await uploadResponse.json();
    const rawUrl = uploadData.content.download_url;
    console.log('✓ Image uploaded successfully:', rawUrl);
    return rawUrl;

  } catch (error) {
    console.error('Error uploading image to GitHub:', error);
    return null;
  }
}

// Build dynamic context menu from stored repos
async function buildContextMenu() {
  // Remove all existing menus
  await chrome.contextMenus.removeAll();

  // Load repos from local storage
  const localData = await chrome.storage.local.get(['reposList']);
  cachedRepos = localData.reposList || [];

  console.log('Building context menu with repos:', cachedRepos.length);

  if (cachedRepos.length === 0) {
    // No repos configured - show disabled parent menu
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Create GitHub Issue with AI',
      contexts: ['selection', 'image'],
      enabled: false
    });
    console.log('No repos - created disabled parent menu');
    return;
  }

  // Create parent menu
  chrome.contextMenus.create({
    id: PARENT_MENU_ID,
    title: 'Create GitHub Issue with AI',
    contexts: ['selection', 'image']
  });

  console.log('Created parent menu');

  // Create submenu for each repo
  cachedRepos.forEach((repo, index) => {
    const prefix = repo.owner.type === 'Organization' ? '[Org]' : '[User]';
    const title = `${prefix} ${repo.full_name}`;

    chrome.contextMenus.create({
      id: `repo-${index}`,
      parentId: PARENT_MENU_ID,
      title: title,
      contexts: ['selection', 'image']
    });
  });

  console.log(`Created ${cachedRepos.length} repo menu items`);
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  if (!info.menuItemId.startsWith('repo-')) {
    console.log('Not a repo menu item, ignoring');
    return;
  }

  // Reload repos from storage to handle service worker restarts
  const localData = await chrome.storage.local.get(['reposList']);
  const repos = localData.reposList || [];

  console.log('Loaded repos from storage:', repos.length);

  const repoIndex = parseInt(info.menuItemId.split('-')[1]);
  const selectedRepo = repos[repoIndex];

  console.log('Selected repo index:', repoIndex, 'Repo:', selectedRepo);

  if (!selectedRepo) {
    console.error('Repository not found at index:', repoIndex);
    showNotification('Error', 'Repository not found');
    return;
  }

  // Check if keys are configured
  const { openaiKey, githubKey } = await chrome.storage.sync.get(['openaiKey', 'githubKey']);

  console.log('Keys configured:', { hasOpenAI: !!openaiKey, hasGitHub: !!githubKey });

  if (!openaiKey || !githubKey) {
    showNotification('Setup Required', 'Please configure your API keys in the extension popup');
    return;
  }

  // Get selection and/or image from content script
  let textContent = '';
  let imageUrl = '';
  let contentType = '';

  // Check for text selection
  if (info.selectionText) {
    textContent = info.selectionText;
    console.log('Text selected:', textContent.length, 'characters');
  } else {
    // Try to get selection from content script
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      if (result && result.trim()) {
        textContent = result.trim();
        console.log('Text selected (from content script):', textContent.length, 'characters');
      }
    } catch (err) {
      // Continue without text
      console.log('No text selection found');
    }
  }

  // Check for image - first from context menu info
  if (info.mediaType === 'image' && info.srcUrl) {
    imageUrl = info.srcUrl;
    console.log('✓ Image found from context menu:', imageUrl);
  } else {
    // If no direct image, ask content script to find a relevant one
    try {
      // Try to send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getRelevantImage' });
      if (response && response.imageUrl) {
        imageUrl = response.imageUrl;
        console.log('✓ Image found from content script:', imageUrl);
      } else {
        console.log('✗ No image found');
      }
    } catch (err) {
      // Content script not loaded - try to inject it and retry
      console.log('Content script not loaded, attempting to inject...');
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        // Wait a moment for it to initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Retry getting the image
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getRelevantImage' });
        if (response && response.imageUrl) {
          imageUrl = response.imageUrl;
          console.log('✓ Image found from content script (after injection):', imageUrl);
        } else {
          console.log('✗ No image found');
        }
      } catch (retryErr) {
        console.log('✗ Could not inject content script or find image:', retryErr);
      }
    }
  }

  // Upload image to GitHub if we found one
  if (imageUrl) {
    console.log('Uploading image to GitHub...');
    const uploadedUrl = await uploadImageToGitHub(imageUrl, selectedRepo.full_name, githubKey);
    if (uploadedUrl) {
      imageUrl = uploadedUrl;
    } else {
      console.log('⚠ Could not upload image, will use original URL');
    }
  }

  // Determine content type based on what we have
  if (textContent && imageUrl) {
    contentType = 'text-and-image';
  } else if (textContent) {
    contentType = 'text';
  } else if (imageUrl) {
    contentType = 'image';
  } else {
    showNotification('No Content', 'Please select text or right-click an image');
    return;
  }

  console.log('Content type:', contentType);

  const content = { text: textContent, image: imageUrl };

  // Show loading badge
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#16a085' });

  // Show on-page loading indicator
  showPageLoader(tab.id, 'Creating issue...');

  // Show processing notification
  showNotification('Processing', `Creating issue in ${selectedRepo.full_name}...`);

  try {
    // Try to fetch issue template from repository
    const template = await fetchIssueTemplate(selectedRepo.full_name, githubKey);

    // Generate issue content with OpenAI
    const { title, body } = await generateIssueContent(content, contentType, openaiKey, info.pageUrl, template);

    // Replace image placeholder with actual image
    const finalBody = imageUrl ? body.replace(/\[IMAGE_PLACEHOLDER\]/g, `![Image](${imageUrl})`) : body;

    console.log('Issue body size:', finalBody.length, 'characters');

    // Create GitHub issue
    const issueUrl = await createGitHubIssue(selectedRepo.full_name, title, finalBody, githubKey);

    // Open issue in new tab immediately
    chrome.tabs.create({ url: issueUrl });

    // Clear loading badge and page loader
    chrome.action.setBadgeText({ text: '' });
    hidePageLoader(tab.id);

    // Show success notification
    showNotification('Success', `Issue created and opened in new tab`);
  } catch (error) {
    console.error('Error creating issue:', error);

    // Clear loading badge and page loader
    chrome.action.setBadgeText({ text: '' });
    hidePageLoader(tab.id);

    showNotification('Error', error.message || 'Failed to create issue');
  }
});

// Fetch issue template from repository
async function fetchIssueTemplate(repoFullName, githubToken) {
  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  // Try common template locations in order
  // Prefer Markdown templates as they're easier for AI to use
  // YAML forms are designed for interactive web forms, not AI templates
  const templatePaths = [
    '.github/ISSUE_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug_report.md',
    '.github/ISSUE_TEMPLATE/feature_request.md',
    'ISSUE_TEMPLATE.md',
    '.github/issue_template.md',
    // Try YAML forms as fallback (will parse them for field info)
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
    '.github/ISSUE_TEMPLATE.yml'
  ];

  for (const path of templatePaths) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${path}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        // Decode base64 content (remove newlines first as GitHub API includes them for readability)
        const template = atob(data.content.replace(/\n/g, ''));
        console.log(`✓ Found issue template at ${path}`);
        return template;
      }
    } catch (error) {
      // Continue to next template location
      console.log(`✗ Template not found at ${path}:`, error.message || 'Not found');
      continue;
    }
  }

  // Try to list and use the first file in .github/ISSUE_TEMPLATE/ directory
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/.github/ISSUE_TEMPLATE`,
      { headers }
    );

    if (response.ok) {
      const files = await response.json();
      console.log(`Found ${files.length} files in .github/ISSUE_TEMPLATE/`);

      // Filter for markdown and yaml files, excluding config
      const templateFiles = files.filter(file =>
        file.type === 'file' &&
        (file.name.endsWith('.md') || file.name.endsWith('.yml') || file.name.endsWith('.yaml')) &&
        file.name !== 'config.yml'
      );

      if (templateFiles.length > 0) {
        // Prefer Markdown templates over YAML (sort .md before .yml/.yaml)
        templateFiles.sort((a, b) => {
          const aIsMd = a.name.endsWith('.md');
          const bIsMd = b.name.endsWith('.md');
          if (aIsMd && !bIsMd) return -1;
          if (!aIsMd && bIsMd) return 1;
          return a.name.localeCompare(b.name); // Alphabetical within same type
        });

        const firstTemplate = templateFiles[0];
        console.log(`Using template file: ${firstTemplate.name} (${templateFiles.length} total templates found)`);

        const templateResponse = await fetch(firstTemplate.url, { headers });
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          const template = atob(templateData.content.replace(/\n/g, ''));
          console.log(`✓ Found issue template: ${firstTemplate.path}`);
          return template;
        }
      }
    }
  } catch (error) {
    console.log('Could not list .github/ISSUE_TEMPLATE/ directory:', error.message);
  }

  // No template found
  console.log('No issue template found in repository');
  return null;
}

// Generate issue title and body using OpenAI
async function generateIssueContent(content, contentType, apiKey, pageUrl, template = null) {
  const templateInstructions = template
    ? `\n\nThe repository has an issue template. Please fill out the template with the relevant information from the selected content:\n\n${template}\n\nUse the template structure but replace placeholders and sections with appropriate content based on the selected text.`
    : '';

  let prompt = '';

  if (contentType === 'text') {
    prompt = `You are an AI assistant helping to create GitHub issues. Based on the following selected text from a webpage, generate a clear and concise GitHub issue.

Selected text:
"""
${content.text}
"""

Source page: ${pageUrl || 'Unknown'}${templateInstructions}

Please respond with a JSON object containing:
- "title": A brief, descriptive title for the GitHub issue (max 80 characters)
- "body": A detailed description including the original content, context, and any relevant information. ALWAYS include the source page URL at the end of the body with a "Source:" label.

Format your response as valid JSON only, no additional text.`;
  } else if (contentType === 'image') {
    prompt = `You are an AI assistant helping to create GitHub issues. Based on an image from a webpage, generate a clear and concise GitHub issue.

The issue contains an image that will be embedded.

Source page: ${pageUrl || 'Unknown'}${templateInstructions}

Please respond with a JSON object containing:
- "title": A brief, descriptive title for the GitHub issue (max 80 characters)
- "body": A detailed description. Use [IMAGE_PLACEHOLDER] exactly where the image should appear in markdown format. Include context and any relevant information. ALWAYS include the source page URL at the end of the body with a "Source:" label.

Format your response as valid JSON only, no additional text.`;
  } else if (contentType === 'text-and-image') {
    prompt = `You are an AI assistant helping to create GitHub issues. Based on the following selected text and an image from a webpage, generate a clear and concise GitHub issue.

Selected text:
"""
${content.text}
"""

The issue also contains an image that will be embedded.

Source page: ${pageUrl || 'Unknown'}${templateInstructions}

Please respond with a JSON object containing:
- "title": A brief, descriptive title for the GitHub issue (max 80 characters)
- "body": A detailed description including the text content. Use [IMAGE_PLACEHOLDER] exactly where the image should appear in markdown format. ALWAYS include the source page URL at the end of the body with a "Source:" label.

Format your response as valid JSON only, no additional text.`;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates well-structured GitHub issues.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content.trim();

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    let jsonString = aiResponse.trim();

    // Remove code fence markers - handle all variations
    // Remove opening fence: ```json, ```JSON, ```
    jsonString = jsonString.replace(/^```[a-zA-Z]*\s*/i, '');
    // Remove closing fence: ```
    jsonString = jsonString.replace(/\s*```\s*$/i, '');
    jsonString = jsonString.trim();

    console.log('Attempting to parse JSON string:', jsonString.substring(0, 100) + '...');

    const parsed = JSON.parse(jsonString);

    if (!parsed.title || !parsed.body) {
      throw new Error('Invalid response format from OpenAI');
    }

    return {
      title: parsed.title.substring(0, 80),
      body: parsed.body
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse);
    console.error('Parse error:', parseError);
    throw new Error('Failed to parse AI response');
  }
}

// Create GitHub issue
async function createGitHubIssue(repoFullName, title, body, githubToken) {
  const response = await fetch(`https://api.github.com/repos/${repoFullName}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      title: title,
      body: body
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('GitHub API error details:', error);
    throw new Error(`GitHub API error: ${error.message || response.statusText}`);
  }

  const issue = await response.json();
  return issue.html_url;
}

// Show Chrome notification
function showNotification(title, message, url = null) {
  const options = {
    type: 'basic',
    iconUrl: 'icon.png',
    title: `Thoth: ${title}`,
    message: message,
    priority: 2
  };

  chrome.notifications.create(options, (notificationId) => {
    if (url) {
      // Open URL when notification is clicked
      const listener = (clickedId) => {
        if (clickedId === notificationId) {
          chrome.tabs.create({ url: url });
          chrome.notifications.onClicked.removeListener(listener);
        }
      };
      chrome.notifications.onClicked.addListener(listener);
    }
  });
}

// Show on-page loading indicator
async function showPageLoader(tabId, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (msg) => {
        // Remove existing loader if any
        const existing = document.getElementById('thoth-loader');
        if (existing) existing.remove();

        // Create loader overlay
        const loader = document.createElement('div');
        loader.id = 'thoth-loader';
        loader.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #16a085 0%, #138871 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: thothSlideIn 0.3s ease-out;
        `;

        // Add animation keyframes
        if (!document.getElementById('thoth-loader-styles')) {
          const style = document.createElement('style');
          style.id = 'thoth-loader-styles';
          style.textContent = `
            @keyframes thothSlideIn {
              from { transform: translateX(400px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes thothSpin {
              to { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }

        // Add spinner
        const spinner = document.createElement('div');
        spinner.style.cssText = `
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: thothSpin 0.8s linear infinite;
        `;

        // Add text
        const text = document.createElement('span');
        text.textContent = msg;

        loader.appendChild(spinner);
        loader.appendChild(text);
        document.body.appendChild(loader);
      },
      args: [message]
    });
  } catch (error) {
    console.log('Could not show page loader:', error);
  }
}

// Hide on-page loading indicator
async function hidePageLoader(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const loader = document.getElementById('thoth-loader');
        if (loader) {
          loader.style.animation = 'thothSlideIn 0.3s ease-out reverse';
          setTimeout(() => loader.remove(), 300);
        }
      }
    });
  } catch (error) {
    console.log('Could not hide page loader:', error);
  }
}

// Handle issue creation from popup
async function handlePopupIssueCreation(data) {
  const { text, repoFullName, pageUrl, openaiKey, githubKey } = data;

  try {
    console.log('Creating issue from popup for repo:', repoFullName);

    // Fetch issue template
    const template = await fetchIssueTemplate(repoFullName, githubKey);

    // Generate issue content with OpenAI
    const content = { text: text, image: '' };
    const { title, body } = await generateIssueContent(content, 'text', openaiKey, pageUrl, template);

    // Create GitHub issue
    const issueUrl = await createGitHubIssue(repoFullName, title, body, githubKey);

    console.log('Issue created from popup:', issueUrl);

    return {
      success: true,
      issueUrl: issueUrl
    };
  } catch (error) {
    console.error('Error creating issue from popup:', error);
    return {
      success: false,
      error: error.message || 'Failed to create issue'
    };
  }
}
