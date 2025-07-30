const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event', 'notice'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  hostedBy: {
    type: String,
    required: function() { return this.type === 'event'; }
  },
  location: {
    type: String,
    required: function() { return this.type === 'event'; }
  },
  date: {
    type: Date,
    required: function() { return this.type === 'event'; }
  },
  isFullDay: {
    type: Boolean,
    default: function() { return this.type === 'event' ? true : undefined; }
  },
  startTime: {
    type: String,
    required: function() { return this.type === 'event' && !this.isFullDay; }
  },
  endTime: {
    type: String,
    required: function() { return this.type === 'event' && !this.isFullDay; }
  },
  taggedStaff: [{
    type: String
  }],
  createdBy: {
    type: String,
    required: true
  },
  createdByEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
