const { salas } = require('./sala');

module.exports = (socket, io) => {
  socket.on("game:buscarJugadores", ({ codigoSala }) => {
    const jugadores = salas[codigoSala];
    if (jugadores) {
      io.to(codigoSala).emit("jugadores", jugadores);
    }
  });

  socket.on("game:actualizarTableroRival", (data)=>{
    console.log(data)
    io.to(data.codigoSala).emit("game:cargarTableroRival", (data))
  })

    socket.on("game:tirandoDadoOponente", (data)=>{
      console.log(data)
    io.to(data.codigoSala).emit("game:tirandoDadoOponente",(data))
  })

      socket.on("game:limpieza", (data)=>{
    io.to(data.codigoSala).emit("game:limpieza",)
  })





};