const mongoose = require('mongoose');

const sheetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  originalLink: {
    type: String,
    required: true
  },
  embeddableLink: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Sheet', sheetSchema); 