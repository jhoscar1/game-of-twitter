const express = require('express');
const router = express.Router();
const Twit = require('twit');
const Promise = require('bluebird');
const config = require('../../secrets');
const processTweet = require('../utils/processTweet')


const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

const stream = T.stream('statuses/filter', {track: 'MAGA', language: 'en'})

const streamedTweets = [];

stream.on('tweet', (newTweet) => {
    newTweet = processTweet.scrubTweet(newTweet);

    if (!streamedTweets.length
        ||
        !streamedTweets.filter((tweet) => {
            return tweet.id === newTweet.id;
        }).length)
    {
            streamedTweets.push(newTweet);
    }
    
        console.log(streamedTweets.length);

    if (streamedTweets.length >= 3) {
        // console.log(streamedTweets);
        let users = [];
        const promiseForUsers = processTweet.getUsersFromRTs(streamedTweets);
        promiseForUsers
        .then((rtUsers) => {
            const moreTweets = processTweet.getTweetsFromRTUsers(rtUsers.splice(0, 10), 'MAGA');
            console.log(moreTweets);
            stream.stop();
        })
        .catch(console.error);
    }
})

stream.on('limit', (message) => {
    console.log('LIMIT', message);
})
