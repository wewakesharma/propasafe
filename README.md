
# PropaSafe: A lightweight BERT-based offline tool for propaganda detection in News Article

## Introduction

A reader assist tool that works **offline** in detection of propaganda in news articles. 

The current tool is a sentence level classification tool that classifies each sentences based on the tone of the sentence. 

## Quick Links:

* [Getting Started](#Getting-Stared)
* [Technical Details] (#Technical-Details)

## Getting Started:

1) Install the requirements in requirements.txt file

```
pip install requirements.txt
```

## Technical Details:

The current model is fine-tuned on PTC dataset. This dataset was first introduced by Martino et. al. 2020 PTC dataset

F1-score:0.71