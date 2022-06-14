const mongoose = require('mongoose');

const ResolutionSchema = new mongoose.Schema({
  download_url: {
    type: String
  },
  token: {
    type: String
  },
  ext: {
    type: String
  },
  vid_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }
});

const Resolution = mongoose.model('Resolution', ResolutionSchema);
module.exports = Resolution;
