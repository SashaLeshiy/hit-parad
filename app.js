const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const users = require('./routes/users');
const cards = require('./routes/cards');
const { login, createUser } = require('./controllers/users');

require('dotenv').config();

const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/hit_parad';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.use(cors({
  origin: [
    'https://hitallica.netlify.app',
    // 'http://hitallica.netlify.app',
    // 'http://localhost:8080',
  ],
  allowedHeaders: ['Content-Type', 'Authorization',
    'Access-Control-Allow-Methods', 'Access-Control-Request-Headers',
    'Access-Control-Allow-Origin'],
  credentials: true,
  enablePreflight: true,
}));

app.post('/signin', cors(), celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use('/', users);
app.use('/', cards);

app.use((req, res, next) => {
  const err = new Error('Hе найдено');
  err.statusCode = 404;
  next(err);
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const { message } = err;
  res.status(status).json({ message: message || 'Произошла ошибка на сервере' });
  return next();
});

app.listen(PORT, () => {
  console.log(`Сервер на порту ${PORT}`);
});
