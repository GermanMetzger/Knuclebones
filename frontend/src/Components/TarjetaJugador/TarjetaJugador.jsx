import React from 'react'
import "./TarjetaJugador.css"

export default function TarjetaJugador({nombre, listo}) {
  return (
    <div className='tarjeta'>
        <h5>{nombre}</h5>
        <h3>{listo ? "Listo" : "No listo"}</h3>
    </div>
  )
}
