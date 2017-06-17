const express = require('express');
const router = express.Router();
const Twit = require('twit');
const Promise = require('bluebird');
const config = require('../../secrets');

const Twitter = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})

const twitRouter = (io) => {

    router.get('/search/:term', (req, res, next) => {
        Twitter.get('search/tweets', {q: req.params.term, count:1, exclude: "retweets"}, (err, data, response) => {
            if (err) console.error(err);
            // Data Statuses
            console.log(data.statuses);
            res.send(data.statuses);
        })  
    })

    router.get('/stream/:term', (req, res, next) => {
        const stream = Twitter.stream('statuses/filter', {track: req.params.term, language: 'en'})

        stream.on('tweet', (newTweet) => {
            io.sockets.emit('new tweet', newTweet);
        })
    })

}

const streamedTweets = [];

// stream.on('tweet', (newTweet) => {
    // console.log(newTweet);
    // newTweet = scrubTweet(newTweet);

    // if (!streamedTweets.length
    //     ||
    //     !streamedTweets.filter((tweet) => {
    //         return tweet.id === newTweet.id;
    //     }).length)
    // {
    //         streamedTweets.push(newTweet);
    // }
    
    //     console.log(streamedTweets.length);

    // if (streamedTweets.length >= 3) {
    //     // console.log(streamedTweets);
    //     let users = [];
    //     const promiseForUsers = getUsersFromRTs(streamedTweets);
    //     promiseForUsers
    //     .then((rtUsers) => {
    //         const moreTweets = getTweetsFromRTUsers(rtUsers.splice(0, 20), 'MAGA');
    //         console.log(moreTweets);
    //         stream.stop();
    //     })
    //     .catch(console.error);
    // }
// })

// stream.on('limit', (message) => {
//     console.log('LIMIT', message);
// })

const removeLeastRTd = (tweetsArr) => {
    return tweetsArr.filter(tweet => {
        return tweet.retweet_count >= 5;
    });
}

const sortByRTs = (tweetsArr) => {
    return tweetsArr.sort((a, b) => {
        return b.retweet_count - a.retweet_count;
    });
}

const getUsersFromRTs = (tweetsArr) => {
    let retweetedUsers = [];

    // Get Promise for RTers
    return Promise.map(tweetsArr, tweet => {
        return Twitter.get(`statuses/retweeters/ids`, {id: tweet.id_str})
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

const getTweetsFromRTUsers = (usersArr, term) => {
    const termLower = term.toLowerCase();
    console.log(usersArr);
    return Promise.map(usersArr, user => {
        return Twitter.get('statuses/user_timeline', {user_id: user.toString(), include_rts: false, count: 10})
    })
    .then(foundTweets => {
        console.log(foundTweets.data);
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
const scrubTweet = (tweet) => {
    if (tweet.retweeted_status && tweet.retweeted_status.retweet_count) {
        tweet = tweet.retweeted_status;
    }
    else if (tweet.quoted_status && tweet.quoted_status.retweet_count) {
        tweet = tweet.quoted_status;
    }
    return tweet;
}

module.exports = twitRouter;