const mongoose = require('mongoose');

const ProxySchema = new mongoose.Schema({
  type: {
    type: String,
    default: "http",
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  port: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});

const Proxy = mongoose.model('Proxy', ProxySchema);
module.exports = Proxy;
