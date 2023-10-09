const mongoose = require('mongoose');

const solicitacaoSchema = new mongoose.Schema({
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
  tel: {
    type: String, 
    required: true
  },
  msg: {
    type: String, 
    required: false
  }, 
  pedente: {
    type: Boolean,
    default: true 
  }
});

module.exports = solicitacaoSchema;