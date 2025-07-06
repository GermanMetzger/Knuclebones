// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React corre por defecto en 3000
    methods: ["GET", "POST"]
  }
});

//constantes
const sala = require("./sockets/sala")
const juego = require("./sockets/juego")

io.on('connection', (socket) => {
  console.log('🔌 Socket conectado:', socket.id);


  //socket modular
  // sala(socket,io)
  // juego(socket,io)
  




  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado:', socket.id);
  });
});

app.get('/', (req, res) => {
  console.log("✅ GET / recibido");
  res.send("Servidor funcionando");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
