const Player = require('../models/Player');

let io; 
let currentGame = null; 

const MAX_TIME = 30;
const TURN_DURATION = 5; 

function initialize(socketIoInstance) {
  io = socketIoInstance;
  console.log('Socket.IO inicializado.');
}

function startGame() {
  if (!currentGame || currentGame.players.length < 2) {
    notifyError('São necessários pelo menos 2 jogadores para iniciar.');
    return;
  }

  currentGame.active = true;
  io.emit('game-start', { players: currentGame.players });
  nextTurn();
}

function handleConnection(socket) {
  console.log(`Jogador conectado: ${socket.id}`);
  
  if (!currentGame) {
    currentGame = createNewGame();
  }

  const player = addPlayerToGame(socket.id);
  if (!player) {
    socket.emit('connection-error', { message: 'Não foi possível conectar.' });
    return;
  }

  notifyPlayersUpdate();

  socket.on('player-click', ({ timeElapsed }) => handlePlayerClick(socket.id, timeElapsed));
  socket.on('disconnect', () => handlePlayerDisconnect(socket.id));
}


function addPlayerToGame(socketId) {
  if (!currentGame) return null;

  const newPlayer = {
    socketId,
    name: `Jogador ${currentGame.players.length + 1}`,
    totalTime: 0,
    eliminated: false,
  };

  currentGame.players.push(newPlayer);
  return newPlayer;
}

function nextTurn() {
  const activePlayers = getActivePlayers();
  if (activePlayers.length < 2) {
    endGame();
    return;
  }

  const currentPlayer = getNextPlayer();
  io.emit('turn-change', { playerId: currentPlayer.socketId });

  setTurnTimeout(currentPlayer);
}

function getActivePlayers() {
  return currentGame.players.filter(player => !player.eliminated);
}

function setTurnTimeout(player) {
  currentGame.timeoutId = setTimeout(() => {
    player.totalTime += TURN_DURATION;
    if (player.totalTime > MAX_TIME) {
      eliminatePlayer(player);
    } else {
      nextTurn();
    }
  }, TURN_DURATION * 1000);
}

function handlePlayerClick(socketId, timeElapsed) {
  const player = findPlayerById(socketId);
  if (!player || player.eliminated) return;

  clearTimeout(currentGame.timeoutId);
  player.totalTime += timeElapsed;

  io.emit('player-clicked', { playerId: socketId, timeElapsed });

  if (player.totalTime > MAX_TIME) {
    eliminatePlayer(player);
  } else {
    nextTurn();
  }
}

function eliminatePlayer(player) {
  player.eliminated = true;
  io.emit('player-eliminated', { playerId: player.socketId });

  if (getActivePlayers().length === 1) {
    endGame();
  } else {
    nextTurn();
  }
}

function handlePlayerDisconnect(socketId) {
  console.log(`Jogador desconectado: ${socketId}`);
  const playerIndex = currentGame.players.findIndex(p => p.socketId === socketId);
  if (playerIndex !== -1) {
    currentGame.players.splice(playerIndex, 1);
    notifyPlayersUpdate();
  }

  if (currentGame.players.length < 2) {
    endGame();
  }
}

function endGame() {
  clearTimeout(currentGame.timeoutId);
  const winner = getActivePlayers()[0];
  io.emit('game-end', { winner: winner ? winner : 'Nenhum vencedor' });

  currentGame = null; 
}

function createNewGame() {
  return {
    players: [],
    active: false,
    timeoutId: null,
  };
}

function notifyError(message) {
  io.emit('game-error', { message });
}

function notifyPlayersUpdate() {
  io.emit('update-players', currentGame.players);
}

function getNextPlayer() {
  const activePlayers = getActivePlayers();
  const nextIndex = (currentGame.currentIndex + 1) % activePlayers.length;
  currentGame.currentIndex = nextIndex;
  return activePlayers[nextIndex];
}

function findPlayerById(socketId) {
  return currentGame.players.find(player => player.socketId === socketId);
}

module.exports = {
  initialize,
  handleConnection,
  startGame,
};
