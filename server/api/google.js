const Language = require('@google-cloud/language');
const projectID = process.env.GOOGLE_PROJECT_ID;

const lang = Language({projectID});

module.exports = lang;