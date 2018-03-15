'use strict';

var express = require('express');
var router = express.Router();

const nlu = require('../lib/nlu');

const features = {
  keywords: {},
  concepts: {},
  sentiment: {},
  entities: {
    model_id: 'en-us-tir'
  },
  emotion: {}
}

router.get('/test', async function(req, res, next) {
  let response = await nlu.analyze(req.query.text, features);
  res.json(response);  
});

router.post('/fileUpload', async function(req, res, next) {
  let response = await nlu.analyze(req.files.file.data.toString('utf8'), features);
  res.json(response);  
});

module.exports = router;
