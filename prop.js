document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    const activeTabUrl = activeTab.url;

    if (activeTabUrl.startsWith('http://') || activeTabUrl.startsWith('https://')) {
      fetchNewsContent(activeTabUrl)
        .then(enableButton)
        .catch(error => console.error("Error during fetching or enabling button:", error));
    } else {
      console.error("Invalid URL for fetching news content:", activeTabUrl);
    }
  });
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
      window.newsData = data;
      console.log("News article fetched and inference completed!");
      return data;
    }
  })
  .catch(error => {
    console.error("Error fetching news content:", error);
    throw error;
  });
}

// Store chart instance globally
let pieChartInstance = null;

function enableButton() {
  document.getElementById('myButton').disabled = false;
  document.getElementById('myButton').textContent = "Detailed Report";
  const newsData = window.newsData;

  const count_mild = newsData.mild_prop;
  const count_severe = newsData.severe_prop;
  const total_sentence = newsData.total_sentence;
  const non_prop = total_sentence - (count_mild + count_severe);

  const score = readabilityScore(total_sentence, count_mild, count_severe);

  // Reset message container
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.innerHTML = '';

  // Create and append text content
  const message = document.createElement('p');
  message.innerHTML = `
    <!--<span style="color: red; font-size: 14px;">Mild sentences: ${count_mild}</span> <br>-->
    <!--<span style="color: darkred; font-size: 14px;">Severe sentences: <b>${count_severe}</b></span> <br>-->
    <!--<span style="font-size: 14px;">Non propaganda sentences: ${non_prop}</span> <br>-->
    <span style="font-size: 18px;">Total sentences: ${total_sentence}</span> <br><br>
    <span style="font-size: 25px; font-weight: bold;">Propasafe Score: ${score}</span>
    <br>
  `;
  messageContainer.appendChild(message);

  // Remove old canvas before creating a new one
  const existingCanvas = document.getElementById('pieChart');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Create new canvas for pie chart
  const chartContainer = document.querySelector('.chart-container');
  const canvas = document.createElement('canvas');
  canvas.id = 'pieChart';
  canvas.width = 200;
  canvas.height = 200;
  chartContainer.innerHTML = ''; // Reset chart container
  chartContainer.appendChild(canvas);

  // Destroy old chart before creating a new one
  if (pieChartInstance !== null) {
    pieChartInstance.destroy();
  }

  // Generate pie chart
  const ctx = canvas.getContext('2d');
  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Mild Propaganda', 'Severe Propaganda', 'Non-Propaganda'],
      datasets: [{
        data: [count_mild, count_severe, non_prop], 
        backgroundColor: ['yellow', 'red', 'green']
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 10, weight: 'bold', color: 'black' }, // Bold black labels
            usePointStyle: true, // Makes the markers circular
            pointStyle: 'rectRounded', // Makes them squarish instead of rectangular
            padding: 8, // Reduces spacing between legend items
          }
        }
      }
    }
  });

  // Set background color based on readability score
  document.body.style.backgroundColor = score === 1 || score === 2 ? 'lightcoral' :
                                        score === 3 ? 'lightorange' :
                                        score === 4 ? 'gold' : 'lightgreen';
}

// Readability scoring function
function readabilityScore(totalInstances, mildInstances, severeInstances) {
  if (totalInstances === 0) {
    return 5;
  }

  const mildPercentage = (mildInstances / totalInstances) * 100;
  const severePercentage = (severeInstances / totalInstances) * 100;

  if (severePercentage > 25 || mildPercentage > 75) {
    return 1;
  } else if (severePercentage > 15 || mildPercentage > 50) {
    return 2;
  } else if (severePercentage > 10 || mildPercentage > 35) {
    return 3;
  } else if (severePercentage > 5 || mildPercentage > 25) {
    return 4;
  } else {
    return 5;
  }
}

// Attach event to button
document.getElementById('myButton').addEventListener('click', openNewsContentInNewTab);