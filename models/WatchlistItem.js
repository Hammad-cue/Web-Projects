const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Establishes the relation back to the User
  },
  externalApiId: {
    type: String, 
    required: true
  },
  title: {
    type: String,
    required: true
  },
  poster_url: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    default: 'movie' // Fallback for any existing items in your DB
  },
  status: {
    type: String,
    enum: ['Plan to Watch', 'Watching', 'Completed', 'Dropped'],
    default: 'Plan to Watch'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  }
}, { timestamps: true });

// Prevent a user from adding the exact same movie multiple times
watchlistItemSchema.index({ user: 1, externalApiId: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);