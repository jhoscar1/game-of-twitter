const Watson = require('watson-developer-cloud/natural-language-understanding/v1.js');

const sentimentalWatson = new Watson({
  'username': process.env.WATSON_USERNAME,
  'password': process.env.WATSON_PASS,
  'version_date': '2017-02-27'
});

const analyzeTweet = (tweet, term) => {
    const parameters = {
        'text': tweet,
        'features': {
            'sentiment': {
                'targets': [term]
            }
        },
    }
    sentimentalWatson.analyze(parameters, (err, response) => {
        if (err) console.error(err);
        else {
            console.log(response);
        }

    });
}

module.exports = sentimentalWatson;
