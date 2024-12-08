
# PropaSafe: A lightweight BERT-based offline tool for propaganda detection in News Article

## Introduction

A reader assist tool that works **offline** in detection of propaganda in news articles. 

The current tool is a sentence level classification tool that classifies each sentences based on the tone of the sentence. 

## Quick Links:

* [Getting Started](#Getting-Stared)
* [Definition](#Definition)
* [Technical Details](#Technical-Details)
* [Scoring System](#Scoring-System)

## Getting Started:

1) Install the requirements in requirements.txt file

```
pip install -r requirements.txt
```

2) Run the classification module file:

```
python server.py
```

3) Run the text processing file:

```
python app.py
```

## Definition:

Although propaganda is a subjective topic. This tool objectively tries to identify propaganda with the definition specified in Martino's paper "SemEval-2020 Task 11: Detection of Propaganda Techniques in News Articles". According to the paper, propaganda is defined as follows:

***Expression of opinion or action by individuals or groups deliberately designed to
influence opinions or actions of other individuals or groups with reference to predetermined ends.***

This propaganda includes 18 types of propaganda. These propaganda types are specified as follows:

* Loaded Language:Using specific words and phrases with strong emotional implications (either positive or negative) to influence an audience.
* Name calling or labeling: Labeling the object of the propaganda campaign as either something the target audience fears, hates, finds undesirable or loves, praise
* Repetition: Repeating the same message over and over again, so that the audience will eventually accept it.
* Exaggeration or minimization: Either representing something in an excessive manner: making
things larger, better, worse or making something seem less important or smaller than it actually is 
* Doubt: Questioning the credibility of someone or something.
* Appeal to fear/prejudice: Seeking to build support for an idea by instilling anxiety and/or panic in
the population towards an alternative, possibly based on preconceived judgments.
* Flag-waving: Playing on strong national feeling or with respect to any group, e.g., race, gender,
political preference) to justify or promote an action or idea.
* Causal oversimplification: Assuming a single cause or reason when there are multiple causes behind
an issue
* Slogans: A brief and striking phrase that may include labeling and stereotyping. Slogans tend to act as emotional appeals.
* Appeal to authority: Stating that a claim is true simply because a valid authority or expert on the issue supports it, without any other supporting evidence.
* Black-and-white fallacy: Presenting two alternative options as the only possibilities, when in fact more possibilities exist.
* dictatorship: telling the audience
exactly what actions to take, eliminating any other possible choice.
* Thought-terminating clich´e: Words or phrases that discourage critical thought and meaningful discussion on a topic.
* Whataboutism: Discredit an opponent’s position by charging them with hypocrisy without directly disproving their argument.
* straw man: When an opponent’s proposition is substituted with a similar one which is then refuted in place of the original 
* Red herring: Introducing irrelevant material to the issue being discussed, so that everyone’s attention is diverted away from the points made 
* Bandwagon: Attempting to persuade the target audience to join in and take the
course of action because “everyone else is taking the same action”
* reductio ad hitlerum: Persuading an audience to disapprove an action or idea by suggesting that it is popular with groups hated in contempt by the target audience

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