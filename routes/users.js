const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');

const {
  getUsers,
  getUserId,
  changeProfile,
  getUser,
} = require('../controllers/users');

router.get('/users', auth, getUsers);
router.get('/users/me', auth, getUser);
router.get('/users/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
  }),
}), getUserId);

router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
  }),
}), changeProfile);

module.exports = router;
