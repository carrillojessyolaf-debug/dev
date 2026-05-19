// ==========================================
// 1. MOTOR GRÁFICO DEL CANVAS (CIRCUITOS ADAPTATIVOS S20)
// ==========================================
const canvas = document.getElementById('canvas-circuitos');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let desfaseCircuito = 0;
    function ajustarCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function bucleCircuitos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
        ctx.lineWidth = 1.5;
        const espaciado = Math.max(40, canvas.width / 10); desfaseCircuito += 0.2;
        for (let x = 0; x < canvas.width; x += espaciado) {
            ctx.beginPath(); ctx.moveTo(x, 0); const puntoQuiebreVertical = canvas.height * 0.4; 
            if (Math.round(x) % Math.round(espaciado * 2) === 0) {
                ctx.lineTo(x, puntoQuiebreVertical); ctx.lineTo(x + (espaciado * 0.5), puntoQuiebreVertical + 30); ctx.lineTo(x + (espaciado * 0.5), canvas.height);
            } else { ctx.lineTo(x, canvas.height); }
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
        for (let i = 0; i < 10; i++) {
            let nodoX = (i * (canvas.width / 5) + desfaseCircuito) % canvas.width;
            let nodoY = (i * (canvas.height / 8) + desfaseCircuito * 0.5) % canvas.height;
            ctx.beginPath(); ctx.arc(nodoX, nodoY, 2.5, 0, Math.PI * 2); ctx.fill();
        }
        requestAnimationFrame(bucleCircuitos);
    }
    window.addEventListener('resize', ajustarCanvas); ajustarCanvas(); bucleCircuitos(); 
}

// ==========================================
// 2. ENLACE SEGURO AL PROCESAMIENTO EN LA NUBE (BACKEND)
// ==========================================
// Aquí defines la URL de tu servidor intermedio para no exponer llaves privadas en el S20
const BACKEND_ORQUESTADOR_URL = "http://localhost:3000/api/viernes/procesar"; 

// ==========================================
// 3. COMPONENTES DE INTERFAZ Y LOGS DE SENSORES
// ==========================================
const botonActivar = document.getElementById('boton-activar');
const subtituloLinea1 = document.getElementById('subtitulo-1');
const subtituloLinea2 = document.getElementById('subtitulo-2');
const inputArchivo = document.getElementById('input-archivo');
const vistaPreviaImg = document.getElementById('vista-previa-img');

let payloadMultimodal = { mimeType: null, datosBase64: null, nombreArchivo: null };
let audioContext = null; let analizador = null; let relojOndasPasivas = null; let wakeLock = null;

if (inputArchivo) {
    inputArchivo.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Completo = event.target.result;
                payloadMultimodal.mimeType = archivo.type;
                payloadMultimodal.nombreArchivo = archivo.name;
                payloadMultimodal.datosBase64 = base64Completo.split(',')[1]; // Extrae solo la cadena binaria pura
                
                if (vistaPreviaImg) {
                    vistaPreviaImg.src = base64Completo; vistaPreviaImg.style.display = "block";
                }
                actualizarSubtitulos("SISTEMA MULTIMODAL", `Imagen indexada en memoria: ${archivo.name}`);
                responderConVoz("Jefe Omar, sensor óptico listo y cargado en el payload.");
            };
            reader.readAsDataURL(archivo);
        }
    });
}

function activarRelojOndasPasivas() {
    const barrasUI = document.querySelectorAll('.barra-onda');
    if (relojOndasPasivas) clearInterval(relojOndasPasivas);
    relojOndasPasivas = setInterval(() => {
        barrasUI.forEach((barra) => {
            barra.style.height = `${Math.floor(Math.random() * (30 - 12 + 1)) + 12}px`;
        });
    }, 100); 
}
function desactivarRelojOndasPasivas() { if (relojOndasPasivas) { clearInterval(relojOndasPasivas); relojOndasPasivas = null; } }
activarRelojOndasPasivas();

async function solicitarWakeLock() {
    if ('wakeLock' in navigator) { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} }
}
solicitarWakeLock();

// ==========================================
// 4. SISTEMA DE EVENTOS PARA BOTONES LATERALES
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".btn-holograma");
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const funcionBoton = boton.getAttribute("title");
            switch(funcionBoton) {
                case "Documento":
                    actualizarSubtitulos("SISTEMA", "Abriendo gestor de documentos en la nube...");
                    responderConVoz("Abriendo registros lógicos, Jefe.");
                    break;
                case "Cámara":
                    actualizarSubtitulos("SISTEMA", "Activando escaneo multimodal... Sensor óptico listo.");
                    break;
                case "Galería":
                    actualizarSubtitulos("SISTEMA", "Accediendo al almacenamiento de imágenes externas...");
                    break;
                case "Mood Relajado":
                    actualizarSubtitulos("VIERNES OS", "Configuración de empatía: Nivel Relajado / Amigable.");
                    responderConVoz("Modo relajado activo. ¿En qué puedo apoyarlo, Omar?");
                    break;
                case "Mood Inteligente":
                    actualizarSubtitulos("VIERNES OS", "Configuración de procesamiento: Modo Analítico Avanzado.");
                    responderConVoz("Núcleo analítico en línea. Sistemas listos para análisis crítico.");
                    break;
                case "Video":
                    actualizarSubtitulos("SISTEMA", "Inicializando canal de captura de video en tiempo real.");
                    responderConVoz("Cámara de video en espera.");
                    break;
                case "Teléfono":
                    actualizarSubtitulos("SISTEMA", "Desplegando marcador numérico de comunicación.");
                    responderConVoz("Abriendo puente telefónico externo.");
                    break;
                case "Transmisión en Vivo":
                    actualizarSubtitulos("VIERNES OS", "Transmisión LIVE enlazada. Analizando flujo de datos continuo.");
                    responderConVoz("Sistemas en transmisión activa permanente.");
                    break;
            }
        });
    });
});

// ==========================================
// 5. CAPA DE CONEXIÓN CON EL BACKEND SEGURO
// ==========================================
async function despacharComandoAlServidor(mensajeUsuario) {
    actualizarSubtitulos("VIERNES OS", "Enrutando comando al servidor seguro...");
    
    // Empaquetar la solicitud unificada (Texto + Imagen si existe)
    const datosEnvio = {
        comando: mensajeUsuario,
        multimodal: payloadMultimodal.datosBase64 ? {
            mimeType: payloadMultimodal.mimeType,
            data: payloadMultimodal.datosBase64
        } : null
    };

    // Resetear inmediatamente el buffer gráfico de la interfaz
    if (payloadMultimodal.datosBase64) {
        payloadMultimodal = { mimeType: null, datosBase64: null, nombreArchivo: null };
        if (vistaPreviaImg) vistaPreviaImg.style.display = "none";
    }

    try {
        // Petición hacia el backend intermedio que resguarda las API Keys
        const respuesta = await fetch(BACKEND_ORQUESTADOR_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosEnvio)
        });

        const datosRetorno = await respuesta.json();

        // El Backend procesa con la IA y devuelve si se requiere ejecutar una función o hablar
        if (datosRetorno.ejecutarFuncion) {
            ejecutarHerramientaEspecialista(datosRetorno.funcionNombre, datosRetorno.funcionArgumentos);
        } else if (datosRetorno.respuestaVoz) {
            responderConVoz(datosRetorno.respuestaVoz);
        }
    } catch (error) {
        console.error("Fallo de conexión externa:", error);
        actualizarSubtitulos("ERROR ENLACE", "Imposible conectar con el servidor de procesamiento.");
    }
}

// ==========================================
// 6. CAPA DE AGENTES ESPECIALISTAS (EJECUCIÓN LOCAL)
// ==========================================
function ejecutarHerramientaEspecialista(nombre, argumentos) {
    switch(nombre) {
        case "controlarAgenda":
            actualizarSubtitulos("AGENTE AGENDA", `Configurando cita: ${argumentos.asunto}`);
            responderConVoz(`Entendido Jefe Omar. Sincronizando el recordatorio en su agenda.`);
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(argumentos.asunto)}`, "_blank");
            break;
            
        case "ejecutarEnlaceTelefonico":
            actualizarSubtitulos("AGENTE TELEFONÍA", `Enlazando terminal externa al: ${argumentos.numero}`);
            responderConVoz(`Abriendo canal de comunicación de voz, Jefe.`);
            window.open(`tel:${argumentos.numero}`, "_self");
            break;
            
        case "abrirPuenteMensajeria":
            actualizarSubtitulos("AGENTE COMUNICACIÓN", `Abriendo entorno de: ${argumentos.plataforma}`);
            responderConVoz(`Abriendo la plataforma solicitada de inmediato.`);
            if (argumentos.plataforma.includes("whatsapp")) {
                window.open("https://api.whatsapp.com/", "_blank");
            } else {
                window.open("https://google.com", "_blank");
            }
            break;
    }
}

// ==========================================
// 7. ESCUCHA ACTIVA AUTÓNOMA CONTINUA (WAKE WORD)
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;

if (SpeechRecognition) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX';
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;

    window.addEventListener('load', () => { try { reconocimiento.start(); } catch(e) {} });

    reconocimiento.onresult = (event) => {
        const indiceUltimoResult = event.results.length - 1;
        const loQueDije = event.results[indiceUltimoResult][0].transcript.toLowerCase().trim();
        
        // El analizador local detecta si el usuario invoca la IA antes de enviarla a la red
        const nombresActivacion = ["viernes", "lu", "il"];
        if (nombresActivacion.some(nombre => loQueDije.includes(nombre))) {
            actualizarSubtitulos("USUARIO", `"${loQueDije}"`);
            desactivarRelojOndasPasivas();
            activarAnalisisBiometrico();
            
            // Enrutar la petición de forma segura al Servidor Intermedio
            despacharComandoAlServidor(loQueDije);
        }
    };
    
    reconocimiento.onend = () => { try { reconocimiento.start(); } catch(e) {} };
}

function activarAnalisisBiometrico() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    const barrasUI = document.querySelectorAll('.barra-onda');
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fuente = audioContext.createMediaStreamSource(stream);
        analizador = audioContext.createAnalyser(); analizador.fftSize = 64; fuente.connect(analizador);
        const bufferLength = analizador.frequencyBinCount; const dataArray = new Uint8Array(bufferLength);
        
        const refrescarOndasVoz = () => {
            if (!analizador) return;
            requestAnimationFrame(refrescarOndasVoz); analizador.getByteFrequencyData(dataArray);
            barrasUI.forEach((barra, indice) => {
                const valorAudio = dataArray[indice] || 0;
                barra.style.height = `${Math.max(10, Math.min(65, valorAudio * 0.4))}px`;
            });
        };
        refrescarOndasVoz();
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close(); analizador = null; activarRelojOndasPasivas();
        }, 3000); 
    }).catch(() => { activarRelojOndasPasivas(); });
}

// ==========================================
// 8. SALIDA DE AUDIO Y LOGS HISTÓRICOS
// ==========================================
function actualizarSubtitulos(emisor, texto) {
    if (subtituloLinea1 && subtituloLinea2) {
        subtituloLinea1.innerText = subtituloLinea2.innerText;
        subtituloLinea2.innerText = `[${emisor}]: ${texto}`;
        const panelContenedor = document.querySelector('.panel-subtitulos');
        if (panelContenedor) panelContenedor.scrollTop = panelContenedor.scrollHeight;
    }
}

// Inyección de texto directa a los subtítulos estilo JARVIS al hablar
function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX'; lectura.rate = 1.0;
    actualizarSubtitulos("Viernes", texto);
    window.speechSynthesis.speak(lectura);
}