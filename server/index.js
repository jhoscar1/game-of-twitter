const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./db');
const store = new SequelizeStore({ db });
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require('socket.io');
const Twitter = require('./api/twitter').Twitter;
module.exports = app;

if (process.env.NODE_ENV === 'development') require('../secrets');

app
  .use(morgan('dev'))
  .use(express.static(path.join(__dirname, '..', 'public')))
  .use(express.static(path.join(__dirname, '..', 'node_modules/bootstrap/dist')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(session({
    secret: process.env.SESSION_SECRET || 'my best friend is Cody',
    store,
    resave: false,
    saveUninitialized: false
  }))
  .use('/api', require('./api'))
  .use((req, res, next) =>
    path.extname(req.path).length > 0 ? res.status(404).send('Not found') : next())
  .use('*', (req, res) =>
    res.sendFile(path.join(__dirname, '..', 'public/index.html')))
  .use((err, req, res, next) =>
    res.status(err.status || 500).send(err.message || 'Internal server error.'));

// const syncDb = () =>
//   db.sync();

// const searchTweets = (term, max_id) => {
//   const options = max_id ? {q: term, count:100, exclude: "retweets"} : {q: term, count:100, exclude: "retweets", max_id: max_id};
//     Twitter.get('search/tweets', options, (err, data, response) => {
//         if (err) console.error(err);
//     })
// }

const server = app.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`));

const io = socketio(server);

io.sockets.on('connection', (socket) => {
  console.log('connected');
  let interval;
  socket.on('term', (term) => {
    // const stream = Twitter.stream('statuses/filter', {track: term, language: 'en'});
    let maxId;
    let i = 0;
    interval = setInterval(() => {
      const options = {q: term, count: 25, exclude: "retweets", max_id: maxId};
      Twitter.get('search/tweets', options, (err, data, response) => {
          if (err) console.error(err);
          data.statuses.forEach(tweet => {
            if (maxId > tweet.id || !maxId) {
              maxId = tweet.id;
            }
          })
          Promise.map(data.statuses, tweet => {
            return Google.detectSentiment(tweet.text)
            .then((results) => {
                //console.log('logged results', results);
                const sentiment = results[0];
                const analysis = {
                    user: tweet.user,
                    coordinates: tweet.coordinates,
                    tweet: tweet.text,
                    score: sentiment.score,
                    magnitude: sentiment.magnitude
                }
                return analysis;
            })
            .catch(console.error)
          })
          .then(sentiments => {
            socket.emit('tweet', sentiments);
          });
      })
      i++;
      if (i >= 6) {
        clearInterval(interval);
      }
    }, 2000)



    // Twitter.get('search/tweets', {q: term, count:100, exclude: "retweets"}, (err, data, response) => {
    //     if (err) console.error(err);
    //     const locatedTweets = data.statuses.filter((tweet) => {
    //       if (tweet.coordinates && tweet.coordinates !== null) {
    //         return tweet
    //       }
    //     })
    //     socket.emit('tweet', locatedTweets)
    // })  

    // stream.on('tweet', (newTweet) => {
    //   const scrubbedTweet = scrubTweet(newTweet);

    //   //if (newTweet.coordinates && data.coordinates !== null) {
    //   socket.emit('tweet', scrubbedTweet)
    //   //}
    // })
  })
  socket.on('disconnect', () => {
    console.log('disconnected...');
  })
})

