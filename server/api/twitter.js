const express = require('express');
const router = express.Router();
const Twit = require('twit');
const Promise = require('bluebird');
const config = require('../../secrets');

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
    if (newTweet.retweeted_status && newTweet.retweeted_status.retweet_count) {
        newTweet = newTweet.retweeted_status;
    }
    else if (newTweet.quoted_status && newTweet.quoted_status.retweet_count) {
        newTweet = newTweet.quoted_status;
    }
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
        const promiseForUsers = getUsersFromRts(streamedTweets);
        promiseForUsers.then(foundUsers => {
            foundUsers.forEach(foundUser => {
                if (foundUser.data.errors) throw foundUser.data.errors
                users = users.concat(foundUser.data.ids);
            })
            return users;
        })
        .then((rtUsers) => {
            console.log(rtUsers);
            console.log('ending')
            stream.stop();
        })
        .catch(console.error);
    }
})

stream.on('limit', (message) => {
    console.log('LIMIT', message);
})

const removeLeastRtd = (tweetsArr) => {
    return tweetsArr.filter(tweet => {
        return tweet.retweet_count >= 5;
    });
}

const getUsersFromRts = (tweetsArr) => {
    // let retweetedUsers = [];
    // console.log('tweets', tweetsArr);
    // Get Promise for RTers
    return Promise.map(tweetsArr, tweet => {
        return T.get(`statuses/retweeters/ids`, {id: tweet.id_str})
    })

    // promiseForUsers.then(foundUserIDs => {
    //     console.log('found em', foundUserIDs)
    //     foundUserIDs.forEach(foundUserID => {
    //         console.log('here', foundUserID.data.ids);
    //         retweetedUsers = retweetedUsers.concat(foundUserID.data.ids);
    //     });
    // })
    // .catch(console.error.bind(console));
    // console.log(retweetedUsers);
    // return retweetedUsers;
}

const getTweetsFromUsers = (usersArr) => {
    const userTweets = [];
}


