document.addEventListener("DOMContentLoaded", () => {
  const toggleBlurButton = document.getElementById("toggleBlur");
  const toggleNavigateButton = document.getElementById("toggleNavigate");
  const messageBox = document.getElementById("messageBox");
  const messageText = document.getElementById("messageText");
  const closeMessageButton = document.getElementById("closeMessage");

  // Function to show custom message box
  function showMessageBox(message) {
    messageText.textContent = message;
    messageBox.classList.remove("hidden");
  }

  // Event listener for closing the custom message box
  if (closeMessageButton) {
    closeMessageButton.addEventListener("click", () => {
      messageBox.classList.add("hidden");
    });
  }

  // Event listener for Toggle Blur button
  if (toggleBlurButton) {
    toggleBlurButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        let tab = tabs[0];

        if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
          showMessageBox("This extension cannot run on Chrome's internal pages."); 
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

  // Event listener for Toggle Navigate button
  if (toggleNavigateButton) {
    toggleNavigateButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        let tab = tabs[0];

        if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
          showMessageBox("Cannot navigate from Chrome internal pages or about: pages."); // Use custom message box
          return;
        }

        // Send message to background script to trigger navigation
        chrome.runtime.sendMessage(
          { action: "toggleNavigate", tabId: tab.id },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message for navigation:", chrome.runtime.lastError);
            } else {
              console.log("Navigation triggered response:", response);
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
