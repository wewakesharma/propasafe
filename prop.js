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
  setTimeout(enableButton, 3000);
});


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

//enable button and change its text with summary
function enableButton(){
  document.getElementById('myButton').disabled = false;
  document.getElementById('myButton').textContent = "Get Detailed Report Now!";
  const newsData = window.newsData;
  count_mild = newsData.mild_prop;
  count_severe = newsData.severe_prop;
  total_sentence = newsData.total_sentence;
  const message = document.createElement('p');
  message.textContent = `Propasafe found ${count_mild} instance of mild and ${count_severe} of severe propaganda instance out of ${total_sentence} instances!`; 
  messageContainer.appendChild(message);
}

// Function to open the news content in a new tab with colored sentences
function openNewsContentInNewTab() {
  if (!window.newsData) {
    console.error("No news content available to display");
    return;
  }

  const newsData = window.newsData;
  const sentences = newsData.body.split(/(?<=[.!?])\s+/);
  const probabilities = newsData.inference.probabilities;

  // Debugging: Check if probabilities have values
  if (!probabilities || probabilities.length === 0) {
    console.error("Probabilities array is empty or not found");
    alert("Probabilities array is empty or not found");
    return;
  }

  //=======Colored section========
  //const coloredSentences = sentences.map(sentence => `<p>${sentence}</p>`).join('');

  const coloredSentences = sentences.map((sentence, index) => {
    const probability = probabilities[index] || 0;
    let color = '';
    if (probability > 0.75) {
      color = 'background-color: red; color: white;';
    } else if (probability > 0.5) {
      color = 'background-color: yellow;';
    }
    return `<p style="${color}">${sentence}</p>`;
  }).join('');

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

// Attach click event to the button to open the news content in a new tab
document.getElementById('myButton').addEventListener('click', openNewsContentInNewTab);