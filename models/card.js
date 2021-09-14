const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  link: {
    type: String,
    required: true,
    match: [/^(https:\/\/)(music.yandex.ru\/album)\/([0-9]+)\/(track)\/([0-9]+)/,
      'invalid url'],
  },
  image: {
    type: String,
  },
  frameSong: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  owner: {
    type: mongoose.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [mongoose.ObjectId],
    ref: 'user',
    default: [],
  },
  listen: {
    type: [mongoose.ObjectId],
    ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('card', cardSchema);
