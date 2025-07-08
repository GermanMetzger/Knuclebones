import { useEffect, useState } from 'react';
import { socket, caidaDados } from "../Home/Home"
import { useNavigate, useSearchParams } from 'react-router-dom'
import Tablero from '../../Components/Tablero/Tablero';
import {motion} from "framer-motion"
import "./Game.css"
import dado1 from "../../Assets/dado1.png"
import dado2 from "../../Assets/dado2.png"
import dado3 from "../../Assets/dado3.png"
import dado4 from "../../Assets/dado4.png"
import dado5 from "../../Assets/dado5.png"
import dado6 from "../../Assets/dado6.png"


function Game() {
    const [jugadores, setJugadores] = useState([])
    const [searchParams] = useSearchParams();
    const [codigoSala, setCodigoSala] = useState("")
     const dadosImgs = { 1: dado1, 2: dado2, 3: dado3, 4: dado4, 5: dado5, 6: dado6 };

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
        <div>
            <div className='espacioDeJuego'>
                {jugadores.map((jugador, idx) =>
                    jugador ? (
                        <Tablero nombre={jugador.nombre} socketId={jugador.socketId} socket={socket} codigoSala={codigoSala} />
                    ) : null
                )}

            </div>
            <div className="envoltorio-dado">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.img
                        hey={i}
                        drag
                        src={dadosImgs[i]}
                        className={`dado${i}`}
                        alt="dado1"
                        variants={caidaDados}
                        animate={"cayendo"}
                        custom={i}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "9px"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default Game