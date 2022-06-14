const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  faq_q: {
    type: String,
    required: true
  },
  faq_ans: {
    type: String,
    required: true
  }
});

const Faq = mongoose.model('Faq', FaqSchema);
module.exports = Faq;
