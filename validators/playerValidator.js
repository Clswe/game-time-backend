const Joi = require('joi');

const startGameSchema = Joi.object({
  playerId: Joi.string().required(),
});

function validateStartGame(req, res, next) {
  const { error } = startGameSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Dados inválidos', details: error.details });
  }
  next();
}

module.exports = { validateStartGame };
