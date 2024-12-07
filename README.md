
# PropaSafe: A lightweight BERT-based offline tool for propaganda detection in News Article

## Introduction

A reader assist tool that works **offline** in detection of propaganda in news articles. 

The current tool is a sentence level classification tool that classifies each sentences based on the tone of the sentence. 

## Quick Links:

* [Getting Started](#Getting-Stared)
* [Technical Details](#Technical-Details)
* [Scoring System](#Scoring-System)

## Getting Started:

1) Install the requirements in requirements.txt file

```
pip install requirements.txt
```

## Technical Details:

The current model is fine-tuned on PTC dataset. This dataset was first introduced by Martino et. al. 2020 PTC dataset

F1-score:0.71

## Scoding System:

* mild instances: Number of sentences classified as mild propaganda, the output of BERT is between 0.50 and 0.75
* severe instances: Number of sentences classified as severe propaganda, the output of BERT is greater than 0.75
* total instances: Total sentences identified in the news article.
* mild percentage: (mild instances/total instance)\*100 
* severe percentage: (severe instances/total instance)\*100


| Mild Percentage  | Severe Percentage | Readability Score |
| ------------- | ------------- | ------------- |
| >75  | >25  |1|
| >50  | >15  |2|
| >35  | >10  |3|
| >25  | >5  |4|
| <=25  | <=5  |5|