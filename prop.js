function fetchNewsContent(url) {
  fetch('http://127.0.0.1:5000/fetch_news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url }),
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    // Save fetched content
    if (data.error) {
      console.error("Error fetching news:", data.error);
    } else {
      window.newsData = data;  // Store the data in a global variable
      console.log("News article fetched!");
    }
  })
  .catch(error => console.error('Error:', error));
}

// Function to open the news content in a new tab with colored sentences
function openNewsContentInNewTab() {
  if (!window.newsData) {
    console.error("No news content available to display");
    return;
  }

  const newsData = window.newsData;
  const sentences = newsData.body.split(/(?<=[.!?])\s+/);
  const coloredSentences = sentences.map(sentence => `<p>${sentence}</p>`).join('');

  const newTab = window.open('', '_blank');
  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${newsData.title}</title>
      </head>
      <body>
        <h1>${newsData.title}</h1>
        <p><strong>Author:</strong> ${newsData.author}</p>
        <div>${coloredSentences}</div>
      </body>
      </html>
    `);
    newTab.document.close();
  } else {
    console.error('Failed to open a new tab');
  }
}

// Automatically fetch news content when the popup loads
document.addEventListener('DOMContentLoaded', function() {
  //const url = window.location.href;
  //fetchNewsContent(url);
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    const activeTabUrl = activeTab.url;

    // Ensure the URL is valid before sending it to the backend
    if (activeTabUrl.startsWith('http://') || activeTabUrl.startsWith('https://')) {
      fetchNewsContent(activeTabUrl);
    } else {
      console.error("Invalid URL for fetching news content:", activeTabUrl);
    }
  });
});

// Attach click event to the button to open the news content in a new tab
document.getElementById('myButton').addEventListener('click', openNewsContentInNewTab);