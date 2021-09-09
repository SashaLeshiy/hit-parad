const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  //   minlength: 2,
  //   maxlength: 30,
  // },
  link: {
    type: String,
    required: true,
    match: [/^(http|https):\/\/(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w\-._~:/?#[\]@!$&'()*+,;=]*)*#?$/,
      'invalid url'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('card', cardSchema);
