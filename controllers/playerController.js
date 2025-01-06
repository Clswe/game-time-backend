const Player = require('../models/Player');
const { startGame, nextTurn, eliminatePlayer } = require('../services/gameManager');


async function validatePlayers() {
  const players = await Player.find();
  return players.length > 1;
}


async function startGameController(req, res) {
  try {
    const hasEnoughPlayers = await validatePlayers();

    if (!hasEnoughPlayers) {
      return res
        .status(400)
        .json({ message: 'É necessário pelo menos 2 jogadores para iniciar o jogo.' });
    }

 
    startGame();
    res.status(200).json({ message: 'Jogo iniciado com sucesso!' });
  } catch (error) {
    console.error('Erro ao iniciar o jogo:', error);
    res.status(500).json({ message: 'Erro ao iniciar o jogo. Tente novamente mais tarde.' });
  }
}

module.exports = {
  startGameController,
};
