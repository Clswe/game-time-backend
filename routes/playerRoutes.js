const express = require('express');
const Player = require('../models/Player');
const gameManager = require('../services/gameManager');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  body('name').isString().notEmpty().withMessage('O nome do jogador é obrigatório e deve ser uma string.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;

      const existingPlayer = await Player.findOne({ name });
      if (existingPlayer) {
        return res.status(400).json({ message: 'Já existe um jogador com este nome.' });
      }

      const player = new Player({ name, socketId: null });
      await player.save();

      res.status(201).json({
        message: 'Jogador registrado com sucesso',
        player,
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao registrar jogador', error: error.message });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const players = await Player.find().sort({ name: 1 });
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar jogadores', error: error.message });
  }
});


router.post('/start', async (req, res) => {
  try {
    const players = await Player.find();

    if (players.length < 2) {
      return res.status(400).json({ message: 'É necessário pelo menos 2 jogadores válidos para iniciar o jogo.' });
    }

    gameManager.startGame();  
    res.status(200).json({ message: 'Jogo iniciado' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao iniciar o jogo', error: error.message });
  }
});

router.post('/play', async (req, res) => {
  const { playerId, reactionTime } = req.body;

  if (typeof reactionTime !== 'number' || reactionTime <= 0) {
    return res.status(400).json({ message: 'Tempo de reação inválido.' });
  }

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: 'Jogador não encontrado.' });
    }

    player.totalTime = (player.totalTime || 0) + reactionTime;

    if (player.totalTime > 30) {
      await gameManager.eliminatePlayer(player); 
      return res.status(200).json({ message: 'Jogador eliminado por tempo excessivo.', eliminatedPlayer: player });
    }

    await player.save(); 

    const players = await Player.find().sort({ name: 1 });
    const currentPlayerIndex = players.findIndex(p => p._id.toString() === playerId);
    const nextPlayer = players[(currentPlayerIndex + 1) % players.length]; 

    res.status(200).json({
      message: 'Jogada registrada. O turno passou para o próximo jogador.',
      nextPlayer,
      eliminatedPlayers: players.filter(p => p.totalTime > 30),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar jogada', error: error.message });
  }
});

router.post('/end', async (req, res) => {
  try {
    const players = await Player.find();

    const winners = players.filter(player => player.totalTime <= 30);

    if (winners.length === 0) {
      return res.status(400).json({ message: 'Não há vencedores, todos foram eliminados.' });
    }

    await Player.updateMany({}, { totalTime: 0 });

    res.status(200).json({
      message: 'Jogo finalizado',
      winners: winners.map(winner => ({
        _id: winner._id,
        name: winner.name,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao finalizar o jogo', error: error.message });
  }
});

router.get('/game-status', async (req, res) => {
  try {
    const players = await Player.find().sort({ name: 1 }); 
    const currentTurnPlayer = players.find(player => player.totalTime <= 30); 

    if (!currentTurnPlayer) {
      return res.status(400).json({ message: 'Não há jogadores válidos no jogo.' });
    }

    const eliminatedPlayers = players.filter(player => player.totalTime > 30);

    res.status(200).json({
      currentTurn: {
        _id: currentTurnPlayer._id,
        name: currentTurnPlayer.name,
      },
      players: players.map(player => ({
        _id: player._id,
        name: player.name,
        totalTime: player.totalTime,
      })),
      remainingTime: 30, 
      eliminatedPlayers: eliminatedPlayers.map(player => ({
        _id: player._id,
        name: player.name,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter o estado do jogo', error: error.message });
  }
});

router.get('/eliminated', async (req, res) => {
  try {
    const players = await Player.find();

    const eliminatedPlayers = players.filter(player => player.totalTime > 30);

    if (eliminatedPlayers.length === 0) {
      return res.status(200).json({ message: 'Nenhum jogador eliminado ainda.' });
    }

    res.status(200).json(
      eliminatedPlayers.map(player => ({
        _id: player._id,
        name: player.name,
        totalTime: player.totalTime, 
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter jogadores eliminados', error: error.message });
  }
});

module.exports = router;
