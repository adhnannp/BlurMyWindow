// Function to create and show the overlay
function showNavigationOverlay(newUrl) {
    let overlay = document.getElementById('navigation-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'navigation-overlay';
        overlay.innerHTML = '<div class="loading-circle"></div>';
        document.body.appendChild(overlay);
    }
    // Force reflow to ensure transition starts from opacity 0
    void overlay.offsetWidth;
    overlay.classList.add('show');

    setTimeout(() => {
        window.location.replace(newUrl);
    }, 500);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startNavigationOverlay") {
        showNavigationOverlay(message.newUrl);
       
    }
});

// This is less likely with window.location.replace, but good practice.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        let overlay = document.getElementById('navigation-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
});
