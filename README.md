# The Game of Twitter

This project was inspired by John Conway's Game of Life but applied to Twitter conversations. My concept was aimed at tracking a sampling of a Twitter conversation and its location and sentiment over many rounds. To do this I queried the Twitter API with a keyword and get a seed round of tweets, their text and location. I then passed the text of those tweets to Google's Natural Language Processing API to get a sentiment analysis of these tweets and then to Google Maps API to plot their location. The step feature which is currently a WIP, was designed to take a user who retweeted one of the seed tweets and grab a tweet from their timeline with the keyword. Additionally, the seed tweets with the fewest retweets would be removed from the list. This effect would simulate the spread and propogation of the sentiment and geography of a conversation on Twitter. I believe that this simulation could be a thought provoking, live insight into the evolution of an online dialogue.

## Start

To run locally you will need to:

Create a file called secrets.js in the project root

This file is .gitignore'd, and will only be required in your development environment
Its purpose is to attach the secret env variables that you'll use while developing
However, it's very important that you not push it to Github! Otherwise, prying eyes will find your secret API keys!
It might look like this:
``` 
  process.env.GOOGLE_CLIENT_ID = 'hush hush';
  process.env.GOOGLE_CLIENT_SECRET = 'pretty secret';
  process.env.GOOGLE_CALLBACK = '/auth/google/callback';
```

Additionally, you will need to set up APIs for Google Maps, Google Natural Language Processing and appropriate Twitter developer keys.

Once those are set up and added to the secrets.js file just run `npm start`!