chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blurEnabled: false });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;
  toggleBlurEffect(tab.id);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "toggle-blur" && tab && tab.id) {
    toggleBlurEffect(tab.id);
  }
  if (command === "toggle-navigate" && tab && tab.id) {
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
      console.warn("Cannot navigate from Chrome internal pages or about: pages.");
      chrome.tabs.sendMessage(tab.id, { action: "showError", message: "Cannot navigate from Chrome internal pages or about: pages." });
      return;
    }
    performNoTraceNavigation(tab.id, "https://www.example.com");
  }
});

// New function to perform navigation by opening a new tab and closing the old one
function performNoTraceNavigation(originalTabId, newUrl) {
  // Create a new tab with the target URL
  chrome.tabs.create({ url: newUrl, active: true }, (newTab) => {
    if (chrome.runtime.lastError) {
      console.error("Error creating new tab:", chrome.runtime.lastError);
      chrome.tabs.sendMessage(originalTabId, { action: "showError", message: "Failed to open new tab." });
      return;
    }
    // Once the new tab is created, close the original tab
    chrome.tabs.remove(originalTabId, () => {
      if (chrome.runtime.lastError) {
        console.error("Error closing original tab:", chrome.runtime.lastError);
      }
    });
  });
}

function toggleBlurEffect(tabId) {
  chrome.storage.sync.get("blurEnabled", ({ blurEnabled }) => {
    let newState = !blurEnabled;
    chrome.storage.sync.set({ blurEnabled: newState });

    chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        let isBlurred = document.body.style.filter.includes("blur");
        document.body.style.filter = isBlurred ? "none" : "blur(10px)";
      }
    }).catch((error) => console.error("Error executing script:", error));
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleBlur") {
    toggleBlurEffect(message.tabId);
    sendResponse({ success: true });
  } else if (message.action === "toggleNavigate") {
    // Handle message from popup to trigger navigation
    if (sender.tab && sender.tab.id) {
      if (sender.tab.url.startsWith("chrome://") || sender.tab.url.startsWith("about:")) {
        console.warn("Cannot navigate from Chrome internal pages or about: pages.");
        sendResponse({ success: false, error: "Cannot navigate from Chrome internal pages or about: pages." });
        return;
      }
      performNoTraceNavigation(sender.tab.id, "https://www.example.com");
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "No active tab found for navigation." });
    }
  }
});
