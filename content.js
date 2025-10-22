// Thoth Content Script
// Captures text selections and image information from web pages

// Track last right-clicked element and position
let lastRightClickedElement = null;
let lastRightClickPosition = { x: 0, y: 0 };

document.addEventListener('contextmenu', (event) => {
  lastRightClickedElement = event.target;
  lastRightClickPosition = { x: event.clientX, y: event.clientY };
});

// Find relevant image near selection or click position
function findRelevantImage() {
  // First check if right-clicked element is an image
  if (lastRightClickedElement && lastRightClickedElement.tagName === 'IMG') {
    return lastRightClickedElement.src;
  }

  // Check if right-clicked element contains an image
  if (lastRightClickedElement && lastRightClickedElement.querySelector) {
    const childImage = lastRightClickedElement.querySelector('img');
    if (childImage) {
      return childImage.src;
    }
  }

  // Get selected text range and find nearby images
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Look for images in the container or its parent
    let searchElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

    // Search up to 3 levels up and down for images
    for (let i = 0; i < 3; i++) {
      if (searchElement) {
        const images = searchElement.querySelectorAll('img');
        if (images.length > 0) {
          // Return the first visible image
          for (const img of images) {
            if (img.offsetWidth > 0 && img.offsetHeight > 0) {
              return img.src;
            }
          }
        }
        searchElement = searchElement.parentElement;
      }
    }
  }

  // Last resort: find image near the click position
  const images = Array.from(document.querySelectorAll('img'));
  for (const img of images) {
    const rect = img.getBoundingClientRect();
    // Check if image is near the click position (within 200px)
    const distance = Math.sqrt(
      Math.pow(rect.left - lastRightClickPosition.x, 2) +
      Math.pow(rect.top - lastRightClickPosition.y, 2)
    );

    if (distance < 200 && img.offsetWidth > 0 && img.offsetHeight > 0) {
      return img.src;
    }
  }

  return null;
}

// Unified message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selectedText = window.getSelection().toString();
    sendResponse({ selectedText: selectedText });
  } else if (request.action === 'getRelevantImage') {
    const imageUrl = findRelevantImage();
    sendResponse({ imageUrl: imageUrl });
  } else if (request.action === 'getLastRightClickedElement') {
    if (lastRightClickedElement && lastRightClickedElement.tagName === 'IMG') {
      sendResponse({
        type: 'image',
        url: lastRightClickedElement.src,
        alt: lastRightClickedElement.alt
      });
    } else {
      sendResponse({ type: 'none' });
    }
  }
  return true; // Keep message channel open for async response
});

console.log('Thoth content script loaded');
