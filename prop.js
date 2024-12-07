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

  const score = readabilityScore(total_sentence, count_mild, count_severe);
  //console.log(`Readability Score: ${score}`);

  message.innerHTML = `
    <span style="color: red; font-size: 18px;">Mild: ${count_mild}</span> <br>
    <span style="color: darkred; font-size: 18px;">Severe: <b>${count_severe}</b></span> <br>
    <span style="font-size: 18px;">Non Propaganda: ${non_prop}</span> <br>
    <span style="font-size: 18px;">Total Sentence: ${total_sentence}</span> <br><br><br>
    <span style="font-size: 25px; font-weight: bold;">Readability Score: ${score}</span>
  `;

  const body = document.querySelector('body');
  if (score === 1 || score === 2) {
    body.style.backgroundColor = 'lightcoral';
  } else if (score === 3) {
    body.style.backgroundColor = 'lightorange';
  } else if (score === 4) {
    body.style.backgroundColor = 'gold';
  } else if (score === 5) {
    body.style.backgroundColor = 'lightgreen';
  }
  
  // append the message to the container
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.appendChild(message);
}

//readability scoring
function readabilityScore(totalInstances, mildInstances, severeInstances) {
  // Handle edge case of zero instances
  if (totalInstances === 0) {
    return 5; // Default to the best score for articles with no content
  }

  // Calculate percentages
  const mildPercentage = (mildInstances / totalInstances) * 100;
  const severePercentage = (severeInstances / totalInstances) * 100;

  // scoring
  if (severePercentage > 25 || mildPercentage > 75) {
    return 1; //worse
  } else if (severePercentage > 15 || mildPercentage > 50) {
    return 2; //poor
  } else if (severePercentage > 10 || mildPercentage > 35) {
    return 3; //average
  } else if (severePercentage > 5 || mildPercentage > 25) {
    return 4; //good
  } else {
    return 5; //best
  }
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