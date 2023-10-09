const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String, 
    required: true 
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  tel: {
    type: String, 
  }, 
  tables: {
    type: Array,
    default: function () {
      return [];
    }
  }
});



module.exports = userSchema;