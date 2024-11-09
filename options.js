//options.js - script to save settings from options.html

// Function to save settings
function saveSettings() {
    const apiKey = document.getElementById('apiKey').value;
    const prompt = document.getElementById('prompt').value;

    // Save to chrome storage
    chrome.storage.sync.set({ apiKey, prompt }, function () {
        const status = document.getElementById('status');
        status.textContent = 'Settings saved successfully!';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
}

// Function to restore settings
function restoreSettings() {
    chrome.storage.sync.get(['apiKey', 'prompt'], function (items) {
        if (items.apiKey) document.getElementById('apiKey').value = items.apiKey;
        if (items.prompt) document.getElementById('prompt').value = items.prompt;
    });
}

// Add event listeners
//document.getElementById('save').addEventListener('click', saveSettings);
//document.addEventListener('DOMContentLoaded', restoreSettings);

