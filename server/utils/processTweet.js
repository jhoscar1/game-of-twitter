const Promise = require('bluebird');
const processTweet = {};

processTweet.removeLeastRTd = (tweetsArr) => {
    return tweetsArr.filter(tweet => {
        return tweet.retweet_count >= 5;
    });
}

processTweet.sortByRTs = (tweetsArr) => {
    return tweetsArr.sort((a, b) => {
        return b.retweet_count - a.retweet_count;
    });
}

processTweet.getUsersFromRTs = (tweetsArr) => {
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

processTweet.getTweetsFromRTUsers = (usersArr, term) => {
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
processTweet.scrubTweet = (tweet) => {
    if (tweet.retweeted_status && tweet.retweeted_status.retweet_count) {
        tweet = tweet.retweeted_status;
    }
    else if (tweet.quoted_status && tweet.quoted_status.retweet_count) {
        tweet = tweet.quoted_status;
    }
    return tweet;
}

module.exports = processTweet;