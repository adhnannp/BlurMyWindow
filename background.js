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
});

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
  }
});
