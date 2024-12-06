// Automatically fetch news content when the popup loads
document.addEventListener('DOMContentLoaded', function() {
  //const url = window.location.href;
  //fetchNewsContent(url);
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    const activeTabUrl = activeTab.url;

    // Ensure the URL is valid before sending it to the backend
    if (activeTabUrl.startsWith('http://') || activeTabUrl.startsWith('https://')) {
      fetchNewsContent(activeTabUrl)
      .then(enableButton) // Enable the button when content and inference are ready
      .catch(error => console.error("Error during fetching or enabling button:", error));;
    } else {
      console.error("Invalid URL for fetching news content:", activeTabUrl);
    }
  });
  //setTimeout(enableButton, 3000);
});

function fetchNewsContent(url) {
  return fetch('http://127.0.0.1:5000/fetch_news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url }),
    mode: 'cors'
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error("Error fetching news:", data.error);
        throw new Error(data.error);
      } else {
        window.newsData = data; // Store the data in a global variable
        console.log("News article fetched and inference completed!");
        return data; // Return the fetched data for further use
      }
    })
    .catch(error => {
      console.error("Error fetching news content:", error);
      throw error; // Propagate the error for handling by the caller
    });
}


//enable button and change text, summary
function enableButton() {
  document.getElementById('myButton').disabled = false;
  document.getElementById('myButton').textContent = "Detailed Report";
  const newsData = window.newsData;

  // Extract counts from newsData
  const count_mild = newsData.mild_prop;
  const count_severe = newsData.severe_prop;
  const total_sentence = newsData.total_sentence;
  const non_prop = total_sentence - (count_mild + count_severe);

  const message = document.createElement('p');

  message.innerHTML = `
    <span style="color: darkorange; font-size: 18px;">Mild: ${count_mild}</span> <br>
    <span style="color: red; font-size: 18px;">Severe: <b>${count_severe}</b></span> <br>
    <span style="font-size: 18px;">Non Propaganda: ${non_prop}</span> <br>
    <span style="font-size: 18px;">Total Sentence: ${total_sentence}</span>
  `;

  // append the message to the container
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(message);
}

//open news data in new tab
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