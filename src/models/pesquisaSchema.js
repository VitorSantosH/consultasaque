const mongoose = require('mongoose');

const pesquisaCpf = new mongoose.Schema({

  autor: {
    type: String,
    required: true
  },
  autorEmail: {
    type: String,
    required: true
  },
  cpf: {
    type: Number,
    required: true
  },
  data: [
    {
      type: Object,
      required: true
    }
  ],
  dataExpiracao: {
    type: Date,
    expires: 60 * 60 * 24 * 3,
  },

});



module.exports = pesquisaCpf;