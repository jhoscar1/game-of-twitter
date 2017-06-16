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

removeLeastRTd = (tweetsArr) => {
    return tweetsArr.filter(tweet => {
        return tweet.retweet_count >= 5;
    });
}

sortByRTs = (tweetsArr) => {
    return tweetsArr.sort((a, b) => {
        return b.retweet_count - a.retweet_count;
    });
}

getUsersFromRTs = (tweetsArr) => {
    let retweetedUsers = [];

    // Get Promise for RTers
    return Promise.map(tweetsArr, tweet => {
        return T.get(`statuses/retweeters/ids`, {id: tweet.id_str})
    })
    .then(foundUsers => {
        foundUsers.forEach(foundUser => {
            if (foundUser.data.errors) throw foundUser.data.errors
            retweetedUsers = retweetedUsers.concat(foundUser.data.ids);
        })
        return retweetedUsers;
    })
    .catch(console.error)
}

getTweetsFromRTUsers = (usersArr, term) => {
    const termLower = term.toLowerCase();
    return Promise.map(usersArr, user => {
        return T.get('statuses/user_timeline', {user_id: user.id_str, include_rts: false, count: 10})
    })
    .then(foundTweets => {
        console.log(foundTweets);
        return foundTweets.filter(foundTweet => {
            if (foundTweet.truncated) {
                return foundTweet.extended_tweet.full_text.toLowerCase() === termLower;
            }
            else {
                return foundTweet.text.toLowerCase() === termLower;
            }
        }).sort((a, b) => {
            return b.retweet_count - a.retweet_count;
        })
        .splice(0, 1);
    })
}

// If tweets from API are RTs or Quoted Tweets we want to go
// From the original tweet so we'll have a good origin point
// from which we can expand
scrubTweet = (tweet) => {
    if (tweet.retweeted_status && tweet.retweeted_status.retweet_count) {
        tweet = tweet.retweeted_status;
    }
    else if (tweet.quoted_status && tweet.quoted_status.retweet_count) {
        tweet = tweet.quoted_status;
    }
    return tweet;
}