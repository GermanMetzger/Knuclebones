import React from 'react'
import "./Tablero.css"
import { useEffect } from 'react'
import { useState } from 'react'
import LineaVerticalDados from '../LineaVerticalDados/LineaVerticalDados'
import { AnimatePresence, motion, scale } from "framer-motion"
import CartelFinal from '../../Components/CartelFinal/CartelFinal';

export default function Tablero({ nombre, socketId, socket, codigoSala }) {
    const tableroVacio = [
        [],
        [],
        []
    ];




    const [yo, setYo] = useState(false)
    const [rival, setRival] = useState(false)
    const [tableroPersonal, setTableroPersonal] = useState(tableroVacio)
    const [tableroRival, setTableroRival] = useState(tableroVacio)
    const [miTurno, setMiTurno] = useState(false);
    const [tirandoDado, setTirandoDado] = useState(false);
    const [tirandoDadoOponente, setTirandoDadoOponente] = useState(false);
    const [dadoActual, setDadoActual] = useState(null);
    const [bloqueado, setBloqueado] = useState(false)
    const [cartelFinal, setCartelFinal] = useState(false)
    const [gano, setGano] = useState(false)
    const esCelular = window.innerWidth < 900;




    useEffect(() => {
        if (socket.id === socketId) {
            setYo(true)
        } else {
            setRival(true)
        }

        if (socket.id === codigoSala) {
            setMiTurno(true)
        }

        socket.on("game:cargarTableroRival", (data) => {
            if (socket.id === data.socketId) {
                // Actualiza tu propio tablero y el del rival
                setTableroPersonal(data.tableroPersonal);
                setTableroRival(data.tableroRival);
                setMiTurno(false);
            } else {
                // El rival actualiza su propio tablero y el tuyo
                setTableroPersonal(data.tableroRival);
                setTableroRival(data.tableroPersonal);
                setMiTurno(true);
            }
        })

        socket.on("game:tirandoDadoOponente", (data) => {
            if (socket.id !== data.socketId) {
                jugarTurnoOponente(data.dado)
            } else {
                console.log("yo no");
            }
        })

        socket.on("game:limpieza", () => {
            setTirandoDadoOponente(false)
        })

    }, [])

    useEffect(() => {
        // Función para saber si un tablero está lleno (todas las columnas tienen 3 dados)
        const tableroLleno = (tablero) => tablero.every(col => col.length === 3);

        if (tableroLleno(tableroPersonal) || tableroLleno(tableroRival)) {
            if (totalTableroPersonal > totalTableroRival) {
                setGano(true);
                setCartelFinal(true);
            } else if (totalTableroPersonal < totalTableroRival) {
                setGano(false);
                setCartelFinal(true);
            } else {
                setGano("empate");
                setCartelFinal(true);
            }

        }
    }, [tableroPersonal, tableroRival]);


    const tirarDado = () => {
        const dado = Math.floor(Math.random() * 6) + 1
        return dado;
    }

    const jugarTurno = () => {
        setBloqueado(true)
        console.log("Tirando dados!")
        setTirandoDado(true);
        let frames = 0;
        const resultado = tirarDado();
        socket.emit("game:tirandoDadoOponente", ({
            socketId: socket.id,
            codigoSala: codigoSala,
            dado: resultado
        }))
        const interval = setInterval(() => {
            setDadoActual(tirarDado());
            frames++;
            if (frames >= 15) {
                clearInterval(interval);
                setDadoActual(resultado);
                setTirandoDado(true);
                setBloqueado(false)
            }
        }, 100);

    };

    const jugarTurnoOponente = (dado) => {
        console.log("oponente tirando dado")
        setTirandoDadoOponente(true);
        let frames = 0;
        const interval = setInterval(() => {
            setDadoActual(tirarDado());
            frames++;
            if (frames >= 15) {
                clearInterval(interval);
                setDadoActual(dado);
                // setTirandoDadoOponente(false);
            }
        }, 100);
    };

    const sumarDadoLinea = (columnaIdx) => {
        if (miTurno && !bloqueado) {
            socket.emit("game:limpieza", ({ codigoSala: codigoSala }))
            if (dadoActual && tableroPersonal[columnaIdx].length < 3) {
                setTableroPersonal(prev => {
                    const nuevoTablero = prev.map((col, idx) =>
                        (idx === columnaIdx) ? [...col, dadoActual] : col
                    );
                    const nuevoTableroRival = tableroRival.map((col, idx) =>
                        (idx === columnaIdx) ? col.filter(numero => numero !== dadoActual) : col
                    )

                    socket.emit("game:actualizarTableroRival", {
                        tableroPersonal: nuevoTablero,
                        tableroRival: nuevoTableroRival,
                        socketId: socketId,
                        codigoSala: codigoSala
                    });
                    return nuevoTablero;
                });
                setTirandoDadoOponente(false);
                setDadoActual(null)

                setTimeout(() => { setTirandoDado(false) }, 1000) // Termina el turno
            } else if (!dadoActual) {
                console.log("Tirar dados primero")
            } else {
                alert("Columna LLENA!")
            }
        }
    };

    const calcularTotalColumna = (col) => {
        if (col.length === 3 && col[0] === col[1] && col[1] === col[2]) {
            return col[0] * 9;
        } else if (col.length >= 2 && col[0] === col[1]) {
            return col[0] * 4 + (col[2] || 0);
        } else if (col.length >= 2 && col[0] === col[2]) {
            return col[0] * 4 + (col[1] || 0);
        } else if (col.length >= 2 && col[1] === col[2]) {
            return col[1] * 4 + (col[0] || 0);
        } else {
            return col.reduce((acc, num) => acc + num, 0);
        }
    };

    const totalTableroPersonal = tableroPersonal.reduce(
        (acc, col) => acc + calcularTotalColumna(col), 0
    );

    const totalTableroRival = tableroRival.reduce(
        (acc, col) => acc + calcularTotalColumna(col), 0
    );




    if (rival) {
        return (
            <AnimatePresence>
                {cartelFinal && <CartelFinal jugador={nombre} gano={gano} puntaje={totalTableroPersonal} />}


                <motion.div className={"espacioRival"}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    <div className='nombreRival' style={!miTurno ? { borderColor: "gold" } : { borderColor: "grey" }}>
                        Puntos de {nombre} = {totalTableroRival}
                    </div>
                    <motion.div className="tableroRival"
                        animate={
                            !miTurno
                                ? {
                                    boxShadow: [
                                        "0 0 1px white",
                                        "0 0 10px white",
                                        "0 0 1px white"
                                    ],
                                    scale: 1
                                }
                                : {
                                    boxShadow: "none",
                                    scale: 1
                                }
                        }
                        transition={
                            !miTurno
                                ? {
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "linear"
                                }
                                : {}
                        }
                    >
                        {tableroRival.map((columna, idx) => (
                            <LineaVerticalDados
                                key={idx}
                                lineaVertical={columna}
                                yo={yo}
                                rival={rival}
                                totalLinea={calcularTotalColumna(columna)}
                            />
                        ))}
                    </motion.div>
                    <div className='espacioDadosRival'>
                        {tirandoDadoOponente && dadoActual && (
                            <motion.img drag dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }} src={require(`../../Assets/dado${dadoActual}.png`)} alt={`Dado ${dadoActual}`} />
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }

    if (yo) {
        return (
            <AnimatePresence>
                <motion.div className="espacioPersonal"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <div className='espacioDadosPersonal'>
                        {miTurno && !tirandoDado && <button onClick={jugarTurno} className='botonTirarDado'>Tirar dado</button>}
                        {tirandoDado && dadoActual && (
                            <AnimatePresence>
                                <motion.img
                                    src={require(`../../Assets/dado${dadoActual}.png`)}
                                    alt={`Dado ${dadoActual}`}
                                    drag
                                    dragConstraints={!esCelular ? { top: -200, bottom: 200, left: 0, right: 600 } : { top: -300, bottom: 0, left: -300, right: 300 }}
                                    onDragEnd={(event, info) => {
                                        console.log("Soltó en:", info.point); // punto donde soltó
                                        let izq = window.innerWidth * 0.35;
                                        let der = window.innerWidth * 0.65;


                                        if (esCelular) {
                                            if (info.point.x < izq) {
                                                sumarDadoLinea(0)
                                            } else if (info.point.x > izq && info.point.x <= der) {
                                                sumarDadoLinea(1)
                                            } else if (info.point.x > der) {
                                                sumarDadoLinea(2)
                                            } else {
                                            }
                                        } else {
                                            if (info.point.x > 550 && info.point.x <= 750) {
                                                sumarDadoLinea(0)
                                            } else if (info.point.x > 750 && info.point.x <= 900) {
                                                sumarDadoLinea(1)
                                            } else if (info.point.x > 900 && info.point.x <= 1200) {
                                                sumarDadoLinea(2)
                                            } else {
                                            }
                                        }

                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{
                                        scale: 0,
                                        opacity: 0,
                                        transition: { duration: 0.5, ease: "easeInOut" }
                                    }}
                                />
                            </AnimatePresence>
                        )}
                    </div>
                    <motion.div className="tableroPersonal"
                        animate={
                            miTurno
                                ? {
                                    boxShadow: [
                                        "0 0 1px white",
                                        "0 0 10px white",
                                        "0 0 1px white"
                                    ],
                                    scale: 1
                                }
                                : {
                                    boxShadow: "none",
                                    scale: 1
                                }
                        }
                        transition={
                            miTurno
                                ? {
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "linear"
                                }
                                : {}
                        }
                    >
                        {tableroPersonal.map((columna, idx) => (
                            <LineaVerticalDados
                                key={idx}
                                lineaVertical={columna}
                                yo={yo}
                                rival={rival}
                                onClick={() => sumarDadoLinea(idx)}
                                totalLinea={calcularTotalColumna(columna)}
                                turno={miTurno}
                            />
                        ))}
                    </motion.div>
                    <div className='nombrePersonal' style={miTurno ? { borderColor: "gold" } : { borderColor: "grey" }}>
                        Puntos de {nombre} = {totalTableroPersonal}
                    </div>
                </motion.div>
            </AnimatePresence>

        )
    }
}
