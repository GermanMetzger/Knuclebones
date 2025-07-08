import React from 'react'
import "./LineaVerticalDados.css"
import dado1 from "../../Assets/dado1.png"
import dado2 from "../../Assets/dado2.png"
import dado3 from "../../Assets/dado3.png"
import dado4 from "../../Assets/dado4.png"
import dado5 from "../../Assets/dado5.png"
import dado6 from "../../Assets/dado6.png"
import { useState } from 'react'
import { useEffect } from 'react'
import { motion } from "framer-motion"

export default function LineaVerticalDados({ lineaVertical, yo, rival, onClick, turno }) {
  const [totalLinea, setTotalLinea] = useState(0);

  useEffect(() => {
    let total = 0;
    let [idx0, idx1, idx2] = lineaVertical
    idx0 = idx0 ?? 0
    idx1 = idx1 ?? 0
    idx2 = idx2 ?? 0
    if (idx0 === idx1 && idx1 === idx2 && idx0 !== 0) {
      total = idx0 * 9
    } else if (idx0 === idx1 && idx0 !== 0 && idx1 !== 0) {
      total = idx0 * 4 + idx2
    } else if (idx0 === idx2 && idx0 !== 0 && idx2 !== 0) {
      total = idx0 * 4 + idx1
    } else if (idx1 === idx2 && idx1 !== 0 && idx2 !== 0) {
      total = idx1 * 4 + idx0
    } else {
      total = idx0 + idx1 + idx2
    }

    // const totalLinea = lineaVertical.reduce((acc, num) => acc + num, 0);
    setTotalLinea(total)
  }, [lineaVertical])

  const insertarDado = (numero) => {
    switch (numero) {
      case 1:
        return dado1;
      case 2:
        return dado2;
      case 3:
        return dado3;
      case 4:
        return dado4;
      case 5:
        return dado5;
      case 6:
        return dado6;
      default:
        return null;
    }
  };

  // eslint-disable-next-line no-lone-blocks
  {
    if (rival) {
      return (
        <motion.div className='lineaDados' onClick={onClick}
          initial={{ borderColor: "transparent" }}
          animate={
            turno ? {
              borderColor: "white"
            } :
              {
                borderColor: "transparent"
              }
          }
        >
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[2] === 0 ? "" : <img src={insertarDado(lineaVertical[2])} alt="" />}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[1] === 0 ? "" : <img src={insertarDado(lineaVertical[1])} alt="" />}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[0] === 0 ? "" : <img src={insertarDado(lineaVertical[0])} alt="" />}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='totalVertical'>{totalLinea}</motion.div>
        </motion.div>
      )
    }
  }

  // eslint-disable-next-line no-lone-blocks
  {
    if (yo) {
      return (
        <motion.div className='lineaDados' onClick={onClick}
          initial={{ borderColor: "transparent" }}
          animate={
            turno ? {
              boxShadow: "0 0 5px white"
            } :
              {
                borderColor: "transparent"
              }
          }
        >
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='totalVertical'>{totalLinea}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[0] === 0 ? "" : <img src={insertarDado(lineaVertical[0])} alt="" />}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[1] === 0 ? "" : <img src={insertarDado(lineaVertical[1])} alt="" />}</motion.div>
          <motion.div whileHover={{ scale: 1.05 }} drag dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }} className='dado'>{lineaVertical[2] === 0 ? "" : <img src={insertarDado(lineaVertical[2])} alt="" />}</motion.div>
        </motion.div >
      )
    }
  }



}
