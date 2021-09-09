const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

const { JWT_SECRET = 'strong-dev-secret' } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      // about: req.body.about,
      // avatar: req.body.avatar,
    }))
    .then((user) => res.send({
      data: {
        name: user.name,
        email: user.email,
        // avatar: user.avatar,
        // about: user.about,
      },
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        const error = new Error('Данные емейл зарегистрирован');
        error.statusCode = 409;
        next(error);
      }
      next(err);
    });
};

module.exports.changeProfile = (req, res, next) => {
  const { name } = req.body;
  User.findByIdAndUpdate(req.user._id, { name }, { runValidators: true, new: true })
    .then((profile) => {
      if (!profile) {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(profile);
      }
    })
    .catch((err) => {
      next(err);
    });
};

// module.exports.changeAvatar = (req, res, next) => {
//   const { avatar } = req.body;
//   User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true, new: true })
//     .then((profile) => {
//       if (!profile) {
//         const err = new Error('Пользователь не найден');
//         err.statusCode = 404;
//         next(err);
//       } else {
//         res.send(profile);
//       }
//     })
//     .catch((err) => {
//       next(err);
//     });
// };

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password, next)
    .then((user) => {
      if (!user) {
        const err = new Error('Неверно указаны почта или пароль');
        err.statusCode = 401;
        next(err);
      } else {
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true }).send({ token });
      }
    })
    .catch((err) => {
      next(err);
    });
};
