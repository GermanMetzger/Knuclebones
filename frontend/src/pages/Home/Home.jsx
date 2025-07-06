import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client';
import "./Home.css";
import { useNavigate, useSearchParams } from 'react-router-dom'
import TarjetaJugador from '../../Components/TarjetaJugador/TarjetaJugador';



export const socket = io("https://knuclebones-production.up.railway.app/");
export default function Home() {
    const navigate = useNavigate()
    const [nombre, setNombre] = useState("")
    const [nombreIngresado, setNombreIngresado] = useState(false)
    const [codigoSala, setCodigoSala] = useState("");
    const [searchParams] = useSearchParams();
    const [enlace, setEnlace] = useState("")
    const [jugadores, setJugadores] = useState([]);
    const [listo, setListo] = useState(false);
    const [comenzar, setComenzar] = useState(false)
    const [host, setHost] = useState(false)
    // const codigoSalaRef = useRef(codigoSala);
    const [preparados, setPreparados] = useState(false);


    useEffect(() => {
        const codigo = searchParams.get("codigo");
        if (codigo) {
            setCodigoSala(codigo)
            console.log("codigo cargado" + codigo)
        }
        socket.on("sala:jugadoresActualizados", (lista) => {
            // console.log(lista)
            setJugadores(lista);
            if(lista.length > 1){
                setPreparados(true)
            }else{
                setPreparados(false)
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

    // useEffect(() => {
    //     codigoSalaRef.current = codigoSala;
    // }, [codigoSala]);



    const copiarEnlace = () => {
        navigator.clipboard.writeText(enlace);
        alert("¡Enlace copiado!");
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
        if(listo){
            setListo(false)
        }else{
            setListo(true)
        }
        socket.emit("sala:jugadorListo", ({
             codigoSala: codigoSala,
             socket:socket.id
         }))
    }

    return (
        <div className='home'>
            <h1>Knuckebones</h1>
            {!nombreIngresado && (
                <div>
                    <h1>Ingresar nombre</h1>
                    <input type="text" onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
                    <button onClick={aceptarNombre}>Cargar</button>
                </div>
            )}
            {nombreIngresado && (
                <div className='sala'>
                    <h1>{jugadores.length === 2 ? "JUGAR" : "ESPERNADO JUGADORES..."}</h1>
                    <div className='espacioTarjetas'>

                        {jugadores.map((jugador, id) => (
                            <TarjetaJugador id={id} nombre={jugador.nombre} listo={jugador.listo} />
                        )
                        )}
                    </div>
                    {!comenzar && host && !preparados && <button onClick={copiarEnlace}>Copiar link</button>}
                    {!listo && preparados && <button onClick={jugadorListo}>Listo</button>}
                    {listo && preparados && <button onClick={jugadorListo}>No Listo</button>}

                </div>
            )}
        </div>
    )
}
