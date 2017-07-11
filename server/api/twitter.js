const express = require('express');
const router = express.Router();
const Twit = require('twit');
const Promise = require('bluebird');
const config = require('../../secrets');
const Google = require('./google');

const Twitter = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000
})


router.get('/search/:term', (req, res, next) => {
    Twitter.get('search/tweets', {q: req.params.term, count:100, exclude: "retweets"}, (err, data, response) => {
        if (err) console.error(err);
        // Data Statuses
        const locatedTweets = data.statuses.map(tweet => {
            if (tweet.user.location && tweet.user.location !== undefined) {
                return tweet.user.location
            }
        })

        Promise.map(data.statuses, tweet => {
            return Google.detectSentiment(tweet.text)
            .then((results) => {
                //console.log('logged results', results);
                const sentiment = results[0];
                const analysis = {
                    tweet: tweet.text,
                    score: sentiment.score,
                    magnitude: sentiment.magnitude
                }
                return analysis;
            })
            .catch(console.error)
        })
        .then(sentiments => {
            res.json(sentiments);
            console.log('what I want', sentiments);
        })
        
    })  
})

router.get('/tweet/country', (req, res, next) => {
    Twitter.get('geo/search', {lat: 37.09024, long:-95.712891, granularity: 'city'}, (err, data, response) => {
        if (err) console.error(err);
        console.log(data.result);
    })
})

router.get('/stream/:term', (req, res, next) => {
    const stream = Twitter.stream('statuses/filter', {track: req.params.term, language: 'en'})

    stream.on('tweet', (newTweet) => {
        if (newTweet.coordinates) console.log(newTweet);
    })
})


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
    console.log('term', term)
    const termLower = term.toLowerCase();
    return Promise.map(usersArr, user => {
        return Twitter.get('statuses/user_timeline', {user_id: user.toString(), include_rts: false, count: 100})
    })
    .then(foundTweets => {
        console.log('found', foundTweets);
        let finalUserTweets = [];
        if (foundTweets.length) {
            foundTweets.forEach(foundTweet => {
                if (Array.isArray(foundTweet.data)) {
                    finalUserTweets = finalUserTweets.concat(/*foundTweet.data.filter(userTweet => {
                        return userTweet.text.toLowerCase().indexOf(termLower) > -1;
                    }).sort((a, b) => {
                        return b.retweet_count - a.retweet_count;
                    })*/
                    foundTweet.data.splice(0, 1));
                }
            })
        }
        return finalUserTweets;

    })
    .catch(console.error);
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

const getProcessTweets = (term, webSocket) => {
    const nextStepTweets = [];
    let maxId;
    let i = 0;
    console.log('here');
    const interval = setInterval(() => {
      const options = {q: term, count: 25, exclude: "retweets", max_id: maxId, lang: 'en'};
      Twitter.get('search/tweets', options, (err, data, response) => {
          if (err) console.error(err);
          if (!data.statuses) return;
          data.statuses.forEach(tweet => {
            if (maxId > tweet.id || !maxId) {
              maxId = tweet.id;
            }
          })
          return Promise.map(data.statuses, tweet => {
            return Google.detectSentiment(tweet.text)
            .then((results) => {
                const sentiment = results[0];
                const analysis = {
                    id_str: tweet.id_str,
                    user: tweet.user,
                    coordinates: tweet.coordinates,
                    text: tweet.text,
                    score: sentiment.score,
                    magnitude: sentiment.magnitude,
                    retweetCount: tweet.retweet_count
                }
                nextStepTweets.push(analysis);
                return analysis;
            })
            .catch(console.error)
          })
          .then(sentiments => {
            webSocket.emit('tweet', sentiments);
          })
          .catch(console.error);
      })
      i++;
      if (i >= 5) {
        clearInterval(interval);
      }
    }, 2000)
    return nextStepTweets;
}

module.exports = {
    Twitter,
    scrubTweet,
    router,
    getUsersFromRTs,
    getTweetsFromRTUsers,
    getProcessTweets,
    sortByRTs
};