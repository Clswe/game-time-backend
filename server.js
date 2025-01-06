const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const playerRoutes = require('./routes/playerRoutes');
const gameManager = require('./services/gameManager');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = configureSocket(server);

configureMiddlewares(app);
connectToDatabase();
registerRoutes(app);
initializeSocketHandlers(io);


const PORT = process.env.PORT || 5000;
startServer(server, PORT);

function configureSocket(server) {
  const ioInstance = new Server(server, {
    cors: { origin: '*' },
  });

  gameManager.initialize(ioInstance);
  return ioInstance;
}

function configureMiddlewares(app) {
  app.use(cors());
  app.use(express.json());
}

function connectToDatabase() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

function registerRoutes(app) {
  app.use('/api/players', playerRoutes);
}

function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Jogador conectado: ${socket.id}`);
    gameManager.handleConnection(socket);
  });
}

function startServer(server, port) {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
