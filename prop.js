// This script will run on page load of the news website
/*document.addEventListener('DOMContentLoaded', function() {
    // Get the current page URL
    const currentURL = window.location.href;

    // Send the URL to the Python backend via Fetch API
    fetch('http://127.0.0.1:5000/fetch_news', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentURL }),
        mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
        // Once we get the data from the Python backend, display it in the popup or a new tab
        const title = data.title;
        const author = data.author;
        const content = data.body;

        // You can manipulate the DOM to show the result on the webpage or send it to a new tab
        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `<h1>${title}</h1><p>Author: ${author}</p><p>${content}</p>`;
        document.body.appendChild(resultDiv);
    })
    .catch(error => console.error('Error:', error));
});*/

/*======this code works for a popup in same page
/function fetchNewsContent(url) {
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
    // Handle the response and display the content
    if (data.error) {
      console.error("Error fetching news:", data.error);
    } else {
      displayNewsContent(data);  // Function to display the news content
    }
  })
  .catch(error => console.error('Error:', error));
}

// This function displays the fetched content in a new popup or on the page
function displayNewsContent(newsData) {
  // Create elements to display the content
  let newsPopup = document.createElement('div');
  newsPopup.style.position = 'fixed';
  newsPopup.style.top = '10%';
  newsPopup.style.left = '10%';
  newsPopup.style.backgroundColor = 'white';
  newsPopup.style.padding = '20px';
  newsPopup.style.border = '1px solid #ccc';
  newsPopup.style.zIndex = '1000';

  let title = document.createElement('h2');
  title.innerText = `Title: ${newsData.title}`;
  newsPopup.appendChild(title);

  let author = document.createElement('p');
  author.innerText = `Author: ${newsData.author}`;
  newsPopup.appendChild(author);

  let content = document.createElement('p');
  content.innerText = `Content: ${newsData.body}`;
  newsPopup.appendChild(content);

  let closeBtn = document.createElement('button');
  closeBtn.innerText = 'Close';
  closeBtn.onclick = () => {
    document.body.removeChild(newsPopup);
  };
  newsPopup.appendChild(closeBtn);

  // Append the news content popup to the body
  document.body.appendChild(newsPopup);
}

// Get the current page URL
let currentURL = window.location.href;

// Fetch the news content when the page loads
fetchNewsContent(currentURL);

===============end of this working section ======*/

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
    // Collect the sentences from the fetched content
    const sentences = data.body.split('. ').map(sentence => sentence.trim() + '.');

    // Send the collected sentences to the Python server
    sendSentencesToServer(sentences);

    // Open a new tab and display the content
    if (data.error) {
      console.error("Error fetching news:", data.error);
    } else {
      openNewsContentInNewTab(data);  // Open news content in a new tab
    }
  })
  .catch(error => console.error('Error:', error));
}

// Function to send sentences to the Python server
function sendSentencesToServer(sentences) {
  fetch('http://127.0.0.1:5000/process_sentences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sentences: sentences }),
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    console.log("Sentences processed:", data.message);
  })
  .catch(error => console.error('Error sending sentences:', error));
}

// Open the fetched content in a new browser tab
function openNewsContentInNewTab(newsData) {
  const newTab = window.open('', '_blank');
  if (newTab) {
    newTab.document.write(`
      <html>
      <head>
        <title>${newsData.title}</title>
      </head>
      <body>
        <h1>${newsData.title}</h1>
        <p> ${newsData.author}</p>
        <div>
          ${newsData.body.split('. ').map(sentence => `<p>${sentence}.</p>`).join('')}
        </div>
      </body>
      </html>
    `);
    newTab.document.close();
  } else {
    console.error('Failed to open a new tab');
  }
}

// Get the current page URL
let currentURL = window.location.href;

// Fetch the news content when the page loads
fetchNewsContent(currentURL);