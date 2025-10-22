// Thoth Popup Script
// Manages settings, API key configuration, and repository selection

// DOM elements
const openaiKeyInput = document.getElementById('openai-key');
const githubKeyInput = document.getElementById('github-key');
const saveOpenaiBtn = document.getElementById('save-openai-btn');
const saveGithubBtn = document.getElementById('save-github-btn');
const openaiStatus = document.getElementById('openai-status');
const githubStatus = document.getElementById('github-status');
const keysStatus = document.getElementById('keys-status');

const apiKeysHeader = document.getElementById('api-keys-header');
const apiKeysToggle = document.getElementById('api-keys-toggle');
const apiKeysContent = document.getElementById('api-keys-content');

const createIssueBtn = document.getElementById('create-issue-btn');
const createIssueStatus = document.getElementById('create-issue-status');
const repoSelectContainer = document.getElementById('repo-select-container');
const quickRepoSelect = document.getElementById('quick-repo-select');
const confirmCreateBtn = document.getElementById('confirm-create-btn');

const loadSourcesBtn = document.getElementById('load-sources-btn');
const loadSourcesStatus = document.getElementById('load-sources-status');
const sourcesContainer = document.getElementById('sources-container');
const sourcesList = document.getElementById('sources-list');
const repoCount = document.getElementById('repo-count');

let currentSelectedText = '';
let currentTabId = null;

// Load saved data on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const syncData = await chrome.storage.sync.get(['openaiKey', 'githubKey']);
  const localData = await chrome.storage.local.get(['sources', 'selectedSources', 'reposList']);

  // Load API keys (mask them for security)
  if (syncData.openaiKey) {
    openaiKeyInput.value = maskKey(syncData.openaiKey);
    openaiKeyInput.dataset.original = syncData.openaiKey;
  }

  if (syncData.githubKey) {
    githubKeyInput.value = maskKey(syncData.githubKey);
    githubKeyInput.dataset.original = syncData.githubKey;
  }

  // Update keys status and auto-collapse if both keys exist
  updateKeysStatus(syncData.openaiKey, syncData.githubKey);
  if (syncData.openaiKey && syncData.githubKey) {
    collapseApiKeys();
  }

  // Load sources if they exist
  if (localData.sources && localData.sources.length > 0) {
    populateSourcesList(localData.sources, localData.selectedSources || []);
    sourcesContainer.style.display = 'block';
    updateRepoCount(localData.reposList);
  }

  // Populate repo dropdown if repos exist
  if (localData.reposList && localData.reposList.length > 0) {
    populateRepoDropdown(localData.reposList);
  }

  // Get current tab for quick actions
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;
});

// Handle input focus to allow editing masked keys
openaiKeyInput.addEventListener('focus', () => {
  if (openaiKeyInput.dataset.original) {
    openaiKeyInput.type = 'text';
    openaiKeyInput.value = openaiKeyInput.dataset.original;
  }
});

openaiKeyInput.addEventListener('blur', () => {
  if (openaiKeyInput.value && openaiKeyInput.value !== openaiKeyInput.dataset.original) {
    openaiKeyInput.dataset.original = openaiKeyInput.value;
  }
  openaiKeyInput.type = 'password';
});

githubKeyInput.addEventListener('focus', () => {
  if (githubKeyInput.dataset.original) {
    githubKeyInput.type = 'text';
    githubKeyInput.value = githubKeyInput.dataset.original;
  }
});

githubKeyInput.addEventListener('blur', () => {
  if (githubKeyInput.value && githubKeyInput.value !== githubKeyInput.dataset.original) {
    githubKeyInput.dataset.original = githubKeyInput.value;
  }
  githubKeyInput.type = 'password';
});

// Load organizations and users
loadSourcesBtn.addEventListener('click', async () => {
  const data = await chrome.storage.sync.get(['githubKey']);

  if (!data.githubKey) {
    showStatus(loadSourcesStatus, 'Please save your GitHub token first', 'error');
    return;
  }

  loadSourcesBtn.disabled = true;
  loadSourcesBtn.textContent = 'Loading...';
  showStatus(loadSourcesStatus, 'Loading sources...', 'info');

  try {
    const sources = await fetchAllSources(data.githubKey);

    if (sources.length === 0) {
      showStatus(loadSourcesStatus, 'No sources found', 'error');
      loadSourcesBtn.disabled = false;
      loadSourcesBtn.textContent = 'Load Organizations & User';
      return;
    }

    // Save sources to local storage
    await chrome.storage.local.set({ sources: sources });

    // Check existing selections
    const localData = await chrome.storage.local.get(['selectedSources']);
    const selectedSources = localData.selectedSources || [];

    // Populate sources list
    populateSourcesList(sources, selectedSources);

    // If there are selections, fetch repos
    if (selectedSources.length > 0) {
      await fetchRepositoriesFromSources(data.githubKey, selectedSources);
    }

    // Show sources section
    sourcesContainer.style.display = 'block';

    showStatus(loadSourcesStatus, `Loaded ${sources.length} sources`, 'success');
    loadSourcesBtn.disabled = false;
    loadSourcesBtn.textContent = 'Refresh Sources';
  } catch (error) {
    console.error('Error loading sources:', error);
    showStatus(loadSourcesStatus, `Error: ${error.message}`, 'error');
    loadSourcesBtn.disabled = false;
    loadSourcesBtn.textContent = 'Load Organizations & User';
  }
});

// Fetch all sources (user + orgs)
async function fetchAllSources(githubToken) {
  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  const sources = [];

  // Fetch current user info
  try {
    const userResponse = await fetch('https://api.github.com/user', { headers });

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }

    const user = await userResponse.json();
    sources.push({
      login: user.login,
      type: 'User'
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user information');
  }

  // Fetch organizations
  try {
    const orgsResponse = await fetch('https://api.github.com/user/orgs', { headers });

    if (orgsResponse.ok) {
      const orgs = await orgsResponse.json();
      orgs.forEach(org => {
        sources.push({
          login: org.login,
          type: 'Organization'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching orgs:', error);
    // Continue even if org fetching fails
  }

  return sources;
}

// Update repo count and dropdown when repos change
function onReposUpdated(repos) {
  updateRepoCount(repos);
  populateRepoDropdown(repos);
}

// Fetch repositories from selected sources
async function fetchRepositoriesFromSources(githubToken, selectedSources) {
  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  const allRepos = [];

  for (const source of selectedSources) {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const endpoint = source.type === 'User'
          ? `https://api.github.com/users/${source.login}/repos?per_page=100&page=${page}`
          : `https://api.github.com/orgs/${source.login}/repos?per_page=100&page=${page}`;

        const response = await fetch(endpoint, { headers });

        if (!response.ok) break;

        const repos = await response.json();

        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos.push(...repos);
          page++;
        }

        // Limit to prevent infinite loops
        if (page > 10) break;
      }
    } catch (error) {
      console.error(`Error fetching repos for ${source.login}:`, error);
    }
  }

  // Strip down to only essential data to save storage space
  const minimalRepos = allRepos.map(repo => ({
    full_name: repo.full_name,
    owner: {
      type: repo.owner.type
    }
  }));

  // Remove duplicates and sort
  const uniqueRepos = Array.from(
    new Map(minimalRepos.map(repo => [repo.full_name, repo])).values()
  );

  const sortedRepos = uniqueRepos.sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Save repos to local storage
  await chrome.storage.local.set({ reposList: sortedRepos });

  // Update repo count and dropdown
  onReposUpdated(sortedRepos);

  return sortedRepos;
}

// Populate sources list with checkboxes
function populateSourcesList(sources, selectedSources) {
  sourcesList.innerHTML = '';

  sources.forEach(source => {
    const isSelected = selectedSources.some(s => s.login === source.login && s.type === source.type);

    const item = document.createElement('div');
    item.className = 'source-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `source-${source.login}`;
    checkbox.checked = isSelected;
    checkbox.addEventListener('change', () => handleSourceToggle(source, checkbox.checked));

    const label = document.createElement('label');
    label.htmlFor = `source-${source.login}`;
    label.textContent = source.login;

    const badge = document.createElement('span');
    badge.className = `badge ${source.type.toLowerCase()}`;
    badge.textContent = source.type === 'User' ? 'USER' : 'ORG';

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(badge);

    sourcesList.appendChild(item);
  });
}

// Handle source checkbox toggle
async function handleSourceToggle(source, isChecked) {
  const localData = await chrome.storage.local.get(['selectedSources']);
  let selectedSources = localData.selectedSources || [];

  if (isChecked) {
    // Add source if not already in list
    if (!selectedSources.some(s => s.login === source.login && s.type === source.type)) {
      selectedSources.push(source);
    }
  } else {
    // Remove source from list
    selectedSources = selectedSources.filter(s => !(s.login === source.login && s.type === source.type));
  }

  // Save selected sources
  await chrome.storage.local.set({ selectedSources });

  // Fetch repositories from selected sources
  const data = await chrome.storage.sync.get(['githubKey']);
  if (data.githubKey && selectedSources.length > 0) {
    await fetchRepositoriesFromSources(data.githubKey, selectedSources);
  } else if (selectedSources.length === 0) {
    // Clear repos if no sources selected
    await chrome.storage.local.set({ reposList: [] });
    onReposUpdated([]);
  }
}

// Update repo count display
function updateRepoCount(repos) {
  if (repos && repos.length > 0) {
    repoCount.textContent = `${repos.length} repositories available from selected sources`;
  } else {
    repoCount.textContent = 'No repositories. Select sources above to load repos.';
  }
}

// Show status message
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message ${type}`;
  element.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

// Mask API key for display
function maskKey(key) {
  if (!key || key.length < 8) return key;

  const start = key.substring(0, 4);
  const end = key.substring(key.length - 4);
  const masked = '•'.repeat(Math.min(20, key.length - 8));

  return `${start}${masked}${end}`;
}

// Update keys status indicator
function updateKeysStatus(openaiKey, githubKey) {
  if (openaiKey && githubKey) {
    keysStatus.textContent = '✓ Configured';
    keysStatus.style.color = '#0e5a2f';
  } else if (openaiKey || githubKey) {
    keysStatus.textContent = '⚠ Incomplete';
    keysStatus.style.color = '#d45f13';
  } else {
    keysStatus.textContent = '✗ Not configured';
    keysStatus.style.color = '#a82810';
  }
}

// Accordion toggle functionality
apiKeysHeader.addEventListener('click', () => {
  const isCollapsed = apiKeysContent.classList.contains('collapsed');
  if (isCollapsed) {
    expandApiKeys();
  } else {
    collapseApiKeys();
  }
});

function collapseApiKeys() {
  apiKeysContent.classList.add('collapsed');
  apiKeysToggle.classList.add('collapsed');
}

function expandApiKeys() {
  apiKeysContent.classList.remove('collapsed');
  apiKeysToggle.classList.remove('collapsed');
}

// Update keys status after saving
saveOpenaiBtn.addEventListener('click', async () => {
  const openaiKey = openaiKeyInput.dataset.original || openaiKeyInput.value.trim();

  if (!openaiKey) {
    showStatus(openaiStatus, 'Please enter an OpenAI API key', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ openaiKey });
    openaiKeyInput.dataset.original = openaiKey;
    openaiKeyInput.value = maskKey(openaiKey);
    openaiKeyInput.type = 'password';
    showStatus(openaiStatus, 'OpenAI key saved', 'success');

    // Update status
    const data = await chrome.storage.sync.get(['githubKey']);
    updateKeysStatus(openaiKey, data.githubKey);
  } catch (error) {
    showStatus(openaiStatus, 'Failed to save key', 'error');
  }
});

saveGithubBtn.addEventListener('click', async () => {
  const githubKey = githubKeyInput.dataset.original || githubKeyInput.value.trim();

  if (!githubKey) {
    showStatus(githubStatus, 'Please enter a GitHub token', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ githubKey });
    githubKeyInput.dataset.original = githubKey;
    githubKeyInput.value = maskKey(githubKey);
    githubKeyInput.type = 'password';
    showStatus(githubStatus, 'GitHub token saved', 'success');

    // Update status
    const data = await chrome.storage.sync.get(['openaiKey']);
    updateKeysStatus(data.openaiKey, githubKey);
  } catch (error) {
    showStatus(githubStatus, 'Failed to save token', 'error');
  }
});

// Populate repository dropdown
function populateRepoDropdown(repos) {
  quickRepoSelect.innerHTML = '';

  if (!repos || repos.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'No repositories available';
    option.disabled = true;
    quickRepoSelect.appendChild(option);
    return;
  }

  repos.forEach(repo => {
    const option = document.createElement('option');
    option.value = repo.full_name;
    const prefix = repo.owner.type === 'Organization' ? '[Org]' : '[User]';
    option.textContent = `${prefix} ${repo.full_name}`;
    quickRepoSelect.appendChild(option);
  });
}

// Create issue button handler
createIssueBtn.addEventListener('click', async () => {
  // Check if keys are configured
  const syncData = await chrome.storage.sync.get(['openaiKey', 'githubKey']);
  if (!syncData.openaiKey || !syncData.githubKey) {
    showStatus(createIssueStatus, 'Please configure your API keys first', 'error');
    expandApiKeys();
    return;
  }

  // Check if repos are loaded
  const localData = await chrome.storage.local.get(['reposList']);
  if (!localData.reposList || localData.reposList.length === 0) {
    showStatus(createIssueStatus, 'Please load repositories first', 'error');
    return;
  }

  // Get selected text from current tab
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: () => window.getSelection().toString()
    });

    currentSelectedText = result.result ? result.result.trim() : '';

    if (!currentSelectedText) {
      showStatus(createIssueStatus, 'No text selected. Please highlight text on the page.', 'error');
      return;
    }

    // Show repo selector
    repoSelectContainer.style.display = 'block';
    showStatus(createIssueStatus, `Text captured (${currentSelectedText.length} chars). Select a repository.`, 'info');
  } catch (error) {
    console.error('Error getting selection:', error);
    showStatus(createIssueStatus, 'Could not get selected text. Try highlighting text first.', 'error');
  }
});

// Confirm create issue
confirmCreateBtn.addEventListener('click', async () => {
  if (!currentSelectedText) {
    showStatus(createIssueStatus, 'No text selected', 'error');
    return;
  }

  const selectedRepo = quickRepoSelect.value;
  if (!selectedRepo) {
    showStatus(createIssueStatus, 'Please select a repository', 'error');
    return;
  }

  confirmCreateBtn.disabled = true;
  confirmCreateBtn.textContent = 'Creating...';
  showStatus(createIssueStatus, 'Creating issue...', 'info');

  try {
    const syncData = await chrome.storage.sync.get(['openaiKey', 'githubKey']);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to background to create issue
    const response = await chrome.runtime.sendMessage({
      action: 'createIssueFromPopup',
      data: {
        text: currentSelectedText,
        repoFullName: selectedRepo,
        pageUrl: tab.url,
        openaiKey: syncData.openaiKey,
        githubKey: syncData.githubKey
      }
    });

    if (response.success) {
      showStatus(createIssueStatus, 'Issue created successfully!', 'success');
      repoSelectContainer.style.display = 'none';
      currentSelectedText = '';

      // Open the issue
      chrome.tabs.create({ url: response.issueUrl });
    } else {
      showStatus(createIssueStatus, `Error: ${response.error}`, 'error');
    }
  } catch (error) {
    console.error('Error creating issue:', error);
    showStatus(createIssueStatus, `Error: ${error.message}`, 'error');
  } finally {
    confirmCreateBtn.disabled = false;
    confirmCreateBtn.textContent = 'Create Issue';
  }
});
