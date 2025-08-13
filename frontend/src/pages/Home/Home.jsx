import { useState, useEffect } from 'react'
import { io } from 'socket.io-client';
import "./Home.css";
import { useNavigate, useSearchParams } from 'react-router-dom'
import TarjetaJugador from '../../Components/TarjetaJugador/TarjetaJugador';
import { delay, motion } from "framer-motion";
import dado1 from "../../Assets/dado1.png"
import dado2 from "../../Assets/dado2.png"
import dado3 from "../../Assets/dado3.png"
import dado4 from "../../Assets/dado4.png"
import dado5 from "../../Assets/dado5.png"
import dado6 from "../../Assets/dado6.png"



export const socket  = await io("https://200.85.177.8:4001/");
//export const socket = io("https://knuclebones-production.up.railway.app/");
// export const socket = io("http://localhost:4000");

export const caidaDados = {
    cayendo: (i) => ({
        y: 1800,
        rotate: 360,
        transition: {
            delay: i * 0.8, // cada dado espera un poco más
            duration: 5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
        }
    })
};

export default function Home() {
    const navigate = useNavigate()
    const [nombre, setNombre] = useState("")
    const [nombreIngresado, setNombreIngresado] = useState(false)
    const [codigoSala, setCodigoSala] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [searchParams] = useSearchParams();
    const [enlace, setEnlace] = useState("")
    const [jugadores, setJugadores] = useState([]);
    const [listo, setListo] = useState(false);
    const [comenzar, setComenzar] = useState(false)
    const [host, setHost] = useState(false)
    // const codigoSalaRef = useRef(codigoSala);
    const [preparados, setPreparados] = useState(false);
    const dadosImgs = { 1: dado1, 2: dado2, 3: dado3, 4: dado4, 5: dado5, 6: dado6 };



    useEffect(() => {
        const codigo = searchParams.get("codigo");
        if (codigo) {
            setCodigoSala(codigo)
            console.log("codigo cargado" + codigo)
        }
        socket.on("sala:jugadoresActualizados", (lista) => {
            // console.log(lista)
alert(socket.id+" / Connected status: "+socket.connected);
            
            setJugadores(lista);
            if (lista.length > 1) {
                setPreparados(true)
            } else {
                setPreparados(false)
                setComenzar(false)
            }
        });



        socket.on("sala:comenzarJuego", () => {
            setComenzar(true);
        })
        socket.on("sala:redireccionarAlJuego", (data) => {
            // console.log(data);
            navigate("/Game?codigo=" + data)
        })

        socket.on("sala:llena", () => {
            alert("SALA LLENA!")
            alert("SALA NUEVA CREADA!")
            setHost(true)
            setCodigoSala(socket.id)
            setEnlace(window.location.origin + window.location.pathname + "?codigo=" + socket.id)
        })
    }, []);




    const copiarEnlace = () => {
        navigator.clipboard.writeText(enlace);
        setCopiado(true);
        setTimeout(() => { setCopiado(false) }, 2000)
    };



    const aceptarNombre = () => {
        setNombreIngresado(true)
        //Invitado
        if (codigoSala) {
            socket.emit("sala:ingreso", {
                nombre: nombre,
                codigoSala: codigoSala
            })
            //Host
        } else {
            setHost(true)
            setCodigoSala(socket.id)
            socket.emit("sala:ingreso", {
                nombre: nombre,
                codigoSala: socket.id
            })
            setEnlace(window.location.href + "?codigo=" + socket.id)
        }
    }



    const jugadorListo = () => {
        if (listo) {
            setListo(false)
        } else {
            setListo(true)
        }
        socket.emit("sala:jugadorListo", ({
            codigoSala: codigoSala,
            socket: socket.id
        }))
    }



    return (
        <div className='home'>
            <motion.h1
                drag
                dragConstraints={{
                    left: -25,
                    right: 25,
                    top: -25,
                    bottom: 25
                }}
                initial={{
                    scale: 1,
                    rotate: 8
                }}
                animate={{
                    scale: 1,
                    rotate: -8,
                    transition: {
                        duration: 1,
                        ease: "easeInOut",
                        type: "spring",
                        repeatType: "mirror",
                        repeat: Infinity
                    },

                }}

                whileTap={{
                    cursor: "grabbing"
                }}
                className='titulo' >Knuckebones</motion.h1>
            {!nombreIngresado && (
                <div className='ingresarNombre' >
                    <motion.input whileHover={{ scale: 1.05 }} type="text" onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            aceptarNombre();
                        }
                    }} placeholder="Nombre" autofocus />

                    <motion.button
                        onClick={aceptarNombre}
                        className="botonCargar"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >Cargar</motion.button>
                </div>
            )}
            {nombreIngresado && (
                <div className='sala'>
                    <h1>{jugadores.length === 2 ? "JUGAR" : "ESPERNADO JUGADORES..."}</h1>
                    <div className='espacioTarjetas'>

                        {jugadores.map((jugador, id) => (
                            <TarjetaJugador
                                id={id}
                                nombre={jugador.nombre}
                                listo={jugador.listo}
                            />
                        )
                        )}
                    </div>
                    {!comenzar && host && !preparados && <motion.button
                        animate={{ backgroundColor: copiado ? "#00BB00" : "white" }}
                        initial={false}
                        onClick={copiarEnlace}
                        className='botonCargar'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >Copiar link</motion.button>}
                    {!listo && preparados && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={jugadorListo}>Listo</motion.button>}
                    {listo && preparados && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={jugadorListo}>No Listo</motion.button>}


                </div>
            )
            }
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
                    />
                ))}
            </div>
        </div >
    )
}
