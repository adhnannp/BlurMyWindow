document.addEventListener("DOMContentLoaded", () => {
  let toggleButton = document.getElementById("toggleBlur");
  
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        let tab = tabs[0];

        if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
          alert("This extension cannot run on Chrome's internal pages.");
          return;
        }

        chrome.runtime.sendMessage(
          { action: "toggleBlur", tabId: tab.id },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else {
              console.log("Response:", response);
            }
          }
        );
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleBlurEffect") {
    chrome.storage.sync.get("blurEnabled", ({ blurEnabled }) => {
      let newState = !blurEnabled;
      chrome.storage.sync.set({ blurEnabled: newState });

      chrome.scripting.executeScript({
        target: { tabId: message.tabId },
        function: () => {
          let isBlurred = document.body.style.filter.includes("blur");
          document.body.style.filter = isBlurred ? "none" : "blur(10px)";
        }
      }).catch((error) => console.error("Error executing script:", error));
    });
  }
});
