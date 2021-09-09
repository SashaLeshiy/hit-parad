const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: [validator.isEmail, 'Емейл не валиден'],
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'James Hetfield',
  },
  // about: {
  //   type: String,
  //   minlength: 2,
  //   maxlength: 30,
  //   default: 'Исследователь',
  // },
  // avatar: {
  //   type: String,
  //   match:
  //  [/^(http|https):\/\/(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w\-._~:/?#[\]@!$&'()*+,;=]*)*#?$/,
  //     'invalid avatar'],
  //   default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  // },
});

userSchema.statics.findUserByCredentials = function compareDataUser(email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const err = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        next(err);
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            const err = new Error('Неправильные почта или пароль');
            err.statusCode = 401;
            next(err);
          }
          return user;
        });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = mongoose.model('user', userSchema);
