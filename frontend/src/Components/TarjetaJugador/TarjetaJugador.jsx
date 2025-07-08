import React from 'react'
import "./TarjetaJugador.css"
import { AnimatePresence, motion } from "framer-motion"

export default function TarjetaJugador({ nombre, listo }) {
  return (
    <AnimatePresence>
      <motion.div
        className='tarjeta'
        drag
        dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          transition: {
            duration: 1,
            ease: "easeInOut",
            type: "spring",
          }
        }}
        whileTap={{
          cursor: "grabbing",
          scale: 0.95
        }}
        whileHover={{ scale: 1.05 }}
        layout
      >
        <h5>{nombre}</h5>
        <h3 style={listo ? { color: "green" } : { color: "red" }}>{listo ? "Listo" : "No listo"}</h3>
      </motion.div>
    </AnimatePresence>
  )
}
