const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String
  },
  source: {
    type: String
  },
  web_url: {
    type: String
  },
  thumbnail: {
    type: String
  },
  dw_date: {
    type: String
  }
});

const Video = mongoose.model('Video', VideoSchema);
module.exports = Video;
