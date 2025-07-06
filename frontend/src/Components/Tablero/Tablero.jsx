import React from 'react'
import "./Tablero.css"
import { useEffect } from 'react'
import { useState } from 'react'
import LineaVerticalDados from '../LineaVerticalDados/LineaVerticalDados'

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
            // Muestra el resultado (puedes hacer un modal, alerta, etc.)
            if (totalTableroPersonal > totalTableroRival) {
                alert("¡Ganaste! " + totalTableroPersonal + " a " + totalTableroRival);
            } else if (totalTableroPersonal < totalTableroRival) {
                alert("¡Perdiste! " + totalTableroPersonal + " a " + totalTableroRival);
            } else {
                alert("¡Empate! " + totalTableroPersonal + " a " + totalTableroRival);
            }
        }
    }, [tableroPersonal, tableroRival]);


    const tirarDado = () => {
        const dado = Math.floor(Math.random() * 6) + 1
        return dado;
    }

    const jugarTurno = () => {
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
        if (miTurno) {
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
                setDadoActual(null); // Limpia el dado actual
                setTirandoDado(false); // Termina el turno
                setTirandoDadoOponente(false); // Termina el turno
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

            <div className={"espacioRival"}>
                <div className='nombreRival'>
                    {!miTurno && <div>Tu turno</div>}
                    {nombre} <br />
                    Puntos:{totalTableroRival}
                </div>
                <div className="tableroRival">
                    {tableroRival.map((columna, idx) => (
                        <LineaVerticalDados
                            key={idx}
                            lineaVertical={columna}
                            yo={yo}
                            rival={rival}
                            totalLinea={calcularTotalColumna(columna)}
                        />
                    ))}
                </div>
                <div className='espacioDadosRival'>
                    {tirandoDadoOponente && dadoActual && (
                        <img src={require(`../../Assets/dado${dadoActual}.png`)} alt={`Dado ${dadoActual}`} />
                    )}
                </div>
            </div>
        )
    }

    if (yo) {
        return (
            <div className="espacioPersonal">
                <div className='espacioDadosPersonal'>
                    {miTurno && !tirandoDado && <button onClick={jugarTurno}>Tirar dado</button>}
                    {tirandoDado && dadoActual && (
                        <img src={require(`../../Assets/dado${dadoActual}.png`)} alt={`Dado ${dadoActual}`} />
                    )}
                </div>
                <div className="tableroPersonal">
                    {tableroPersonal.map((columna, idx) => (
                        <LineaVerticalDados
                            key={idx}
                            lineaVertical={columna}
                            yo={yo}
                            rival={rival}
                            onClick={() => sumarDadoLinea(idx)}
                            totalLinea={calcularTotalColumna(columna)}
                        />
                    ))}
                </div>
                <div className='nombrePersonal'>
                    {miTurno && <div>Tu turno</div>}
                    {nombre} <br />
                    Puntos:{totalTableroPersonal}
                </div>
            </div>

        )
    }
}
