const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  full_name: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile_pic: {
    type: String,
    default: 'profile.png'
  },
});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
