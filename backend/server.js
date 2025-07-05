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
    origin: ["http://localhost:3000", "http://localhost:4000", "http://localhost:5173"], // React corre por defecto en 3000
    methods: ["GET", "POST"]
  }
});

//constantes
const sala = require("./sockets/sala")
const juego = require("./sockets/juego")

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);


  //socket modular
  sala(socket,io)
  juego(socket,io)
  




  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send("Servidor funcionando");
});

server.listen(4000, () => {
  console.log("Servidor en http://localhost:4000");
});
