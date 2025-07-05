import { useEffect, useState } from 'react';
import { socket } from "../Home/Home"
import { useNavigate, useSearchParams } from 'react-router-dom'
import Tablero from '../../Components/Tablero/Tablero';
import "./Game.css"


function Game() {
    const navigate = useNavigate()
    const [jugadores, setJugadores] = useState([])
    const [searchParams] = useSearchParams();
    const [codigoSala, setCodigoSala] = useState("")

    useEffect(() => {
        const codigo = searchParams.get("codigo");
        setCodigoSala(codigo);
        socket.emit("game:buscarJugadores", ({ codigoSala: codigo }))

        socket.on("jugadores", (data) => {

            if (Array.isArray(data)) {
                const yo = data.find(j => j.socketId === socket.id);
                const rival = data.find(j => j.socketId !== socket.id);
                setJugadores([rival, yo]); // rival arriba, tú abajo
            }
        })
    }, [])





    return (
        <div className='espacioDeJuego'>
            {jugadores.map((jugador, idx) =>
                jugador ? (
                    <Tablero nombre={jugador.nombre} socketId={jugador.socketId} socket={socket} codigoSala={codigoSala}/>
                ) : null
            )}
        </div>
    )
}

export default Game