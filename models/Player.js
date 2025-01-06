const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: false,
    default: null,
    validate: {
      validator: function (v) {
        return !v || /^[a-zA-Z0-9_-]{10,}$/.test(v);
      },
      message: 'socketId deve ser um ID válido.',
    },
  },
  name: {
    type: String,
    required: true,
    unique: true, 
    trim: true,   
    minlength: [3, 'O nome deve ter pelo menos 3 caracteres.'],
  },
  totalTime: {
    type: Number,
    default: 0,
    min: [0, 'O tempo total não pode ser negativo.'],
  },
  isActive: {
    type: Boolean,
    default: true, 
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Player', playerSchema);
