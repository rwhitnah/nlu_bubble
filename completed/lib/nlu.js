'use strict';

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const creds = require('../config/nlu_creds.json');

const nlu = new NaturalLanguageUnderstandingV1({
  username: creds.username,
  password: creds.password,
  version_date: '2018-02-18',
  url: creds.url
});

const analyze = (fileData, features) => {
  return new Promise((resolve, reject) => {
    nlu.analyze(
      {
        text: fileData,
        features: features
      },
      function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }
    );    
  });
}

module.exports = { analyze }
