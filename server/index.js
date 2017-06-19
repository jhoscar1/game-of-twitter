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
const getUsersFromRTs = require('./api/twitter').getUsersFromRTs;
const getProcessTweets = require('./api/twitter').getProcessTweets;
const getTweetsFromRTUsers = require('./api/twitter').getTweetsFromRTUsers;
const Google = require('./api/google');
const Promise = require('bluebird');
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
  let tweetsForNextSteps;
  socket.on('term', (term) => {
    // const stream = Twitter.stream('statuses/filter', {track: term, language: 'en'});
    tweetsForNextSteps = getProcessTweets(term, socket);

    // stream.on('tweet', (newTweet) => {
    //   const scrubbedTweet = scrubTweet(newTweet);

    //   //if (newTweet.coordinates && data.coordinates !== null) {
    //   socket.emit('tweet', scrubbedTweet)
    //   //}
    // })
  })

  socket.on('step', (term) => {
    const promisedUsersArr = getUsersFromRTs(tweetsForNextSteps.splice(0, 25));
    promisedUsersArr
    .then((usersArr) => {
      console.log(usersArr);
      //const moreTweets = getTweetsFromRTUsers(usersArr.splice(0, 25), term);
      console.log('moooore');
    })
  })

  socket.on('disconnect', () => {
    console.log('disconnected...');
  })
})

