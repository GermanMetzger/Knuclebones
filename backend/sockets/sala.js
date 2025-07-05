
salas = {};

module.exports = (socket, io) => {
  socket.on('sala:ingreso', (data) => {
    if (!salas[data.codigoSala]) {
      salas[data.codigoSala] = [];
    }
    if (salas[data.codigoSala].length < 2) {
      salas[data.codigoSala].push({ nombre: data.nombre, listo: false, socketId: socket.id });
      socket.join(data.codigoSala);
      io.to(data.codigoSala).emit('sala:jugadoresActualizados', salas[data.codigoSala]);
      if (salas[data.codigoSala].length === 2) {
        io.to(data.codigoSala).emit('sala:comenzarJuego');
      }
    } else {
      salas[socket.id] = []
      socket.emit("sala:llena")
      salas[socket.id].push({ nombre: data.nombre, listo: false, socketId: socket.id });
      socket.join(socket.id);
      io.to(socket.id).emit('sala:jugadoresActualizados', salas[socket.id]);
    }
    console.log(salas)
  });

  socket.on("sala:comenzarJuego", (data) => {
    io.to(data.codigoSala).emit('sala:redireccionarAlJuego', (data));
  })

  socket.on("sala:buscarJugadores", (data) => {
    io.to(data.codigoSala).emit("sala:jugadores", (salas[data.codigoSala]))
  })

  socket.on("sala:jugadorListo", (data) => {
    const { codigoSala, socket: socketId } = data;

    if (salas[codigoSala]) {
      // Accedo directamente al array dentro de salas
      const jugadores = salas[codigoSala];
      const jugador = salas[codigoSala].find(jugadores => jugadores.socketId === socketId);

      if (jugador) {
        if (jugador.listo) {
          jugador.listo = false;
          console.log(jugador.nombre +" No esta listo!")
        } else {
          console.log(jugador.nombre+" Esta listo!")
          jugador.listo = true;
        }
      }


      const todosListos = jugadores.length > 1 && jugadores.every(j => j.listo);


      // Emitir la lista actualizada a todos los sockets de esa sala
      io.to(codigoSala).emit("sala:jugadoresActualizados", salas[codigoSala]);


      if (todosListos) {
        // Emitir un evento a todos los jugadores de la sala
        io.to(codigoSala).emit("sala:redireccionarAlJuego", codigoSala);
        console.log(`Todos listos en la sala ${codigoSala}, ¡comienza el juego!`);
      }
    }
  });

  socket.on('disconnect', () => {
    for (const codigoSala in salas) {
      salas[codigoSala] = salas[codigoSala].filter(jugador => jugador.socketId !== socket.id);
      // Si la sala queda vacía, puedes eliminarla
      if (salas[codigoSala].length === 0) {
        delete salas[codigoSala];
      } else {
        io.to(codigoSala).emit('sala:jugadoresActualizados', salas[codigoSala]);
      }
    }
    console.log('Usuario desconectado:', socket.id);
  });
};

module.exports.salas = salas;

