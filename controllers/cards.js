const request = require('request-promise');
const cheerio = require('cheerio');
const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => {
      next(err);
    });
};

module.exports.getCardId = (req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        const err = new Error('Не найдено');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { link } = req.body;
  const owner = req.user._id;
  let title;
  let image = '';
  Card.findOne({ link })
    .then((song) => {
      if (song) {
        const err = new Error('Есть уже такая песня!');
        err.statusCode = 400;
        next(err);
      }
      return song;
    })
    .then((song) => {
      if (!song) {
        request(`${link}`)
          .then((html) => {
            const $ = cheerio.load(html);
            // eslint-disable-next-line prefer-destructuring
            title = $('title').text().split('.')[0];
            image = $('.entity-cover__image').attr('src');
          })
          .then(() => {
            const songFrame = link.split(/[/?]/);
            const frameSong = `${songFrame[0]}//${songFrame[2]}/iframe/#track/${songFrame[6]}/${songFrame[4]}`;
            Card.create({
              link, owner, title, image, frameSong,
            })
              .then((card) => {
                res.send(card);
              })
              .catch((err) => {
                next(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        const err = new Error('Не найдено');
        err.statusCode = 404;
        next(err);
      }
      return card;
    })
    .then((card) => {
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        const err = new Error('Нет доступа');
        err.statusCode = 403;
        next(err);
      } else {
        Card.findByIdAndRemove(req.params.cardId)
          .then(() => {
            res.send({ message: `Карточка ${req.params.cardId} удалена` });
          })
          .catch(() => {
            next();
          });
      }
    })
    .catch(() => {
      next();
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id }, $inc: { rating: 3 } },
    { new: true })
    .then((card) => {
      if (!card) {
        const err = new Error('Не найдено');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new Error('Некорректные данные');
        error.statusCode = 400;
        next(error);
      }
      next(err);
    });
};

module.exports.listenCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { listen: req.user._id }, $inc: { rating: 1 } },
    { new: true })
    .then((card) => {
      if (!card) {
        const err = new Error('Не найдено');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new Error('Некорректные данные');
        error.statusCode = 400;
        next(error);
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id }, $inc: { rating: -3 } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const err = new Error('Не найдено');
        err.statusCode = 404;
        next(err);
      } else {
        res.send(card);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new Error('Некорректные данные');
        error.statusCode = 400;
        next(error);
      }
      next(err);
    });
};
