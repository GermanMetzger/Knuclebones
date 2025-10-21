import React from 'react'
import "./CartelFinal.css"
import { useNavigate } from 'react-router-dom'
import { div } from 'framer-motion/client'

export default function CartelFinal({ jugador, gano, puntaje }) {
  const navigate = useNavigate()

  return (
    <div className='fondoTransparante'>

      <div className="cartel-final">
        {gano && <h1>{jugador ? `¡Felicidades ${jugador}! Has ganado!` : "Fin del juego"}</h1>}
        {!gano && <h1>{jugador ? `Que lastima ${jugador}! Has perdido!` : "Fin del juego"}</h1>}
        {gano === "empate" && <h1>{jugador ? `¡Empate! ${jugador}!` : "Fin del juego"}</h1>}
        {puntaje && <h2>Tu puntaje es: {puntaje}</h2>}
        {gano && <h3>🏆¡Disfruta de tu victoria!🏆</h3>}
        {gano === "empate" && <h3>🥈¡Disfruta de tu empate!🥈</h3>}
        {!gano && <h3>😵¡Mas suerte la proxima!😵</h3>}

        <button onClick={() => navigate("/")}>Volver al inicio</button>

      </div>
    </div>
  )
}
