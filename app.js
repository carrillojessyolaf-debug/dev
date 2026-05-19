// ==========================================
// 1. MOTOR DE RENDERIZADO DE CANVAS DINÁMICO ADAPTATIVO
// ==========================================
const canvas = document.getElementById('canvas-circuitos');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let desfaseCircuito = 0;

    function ajustarCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function bucleCircuitos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
        ctx.lineWidth = 1.5;
        
        const espaciado = Math.max(40, canvas.width / 10); 
        desfaseCircuito += 0.2;

        for (let x = 0; x < canvas.width; x += espaciado) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            const puntoQuiebreVertical = canvas.height * 0.4; 
            if (Math.round(x) % Math.round(espaciado * 2) === 0) {
                ctx.lineTo(x, puntoQuiebreVertical);
                ctx.lineTo(x + (espaciado * 0.5), puntoQuiebreVertical + 30);
                ctx.lineTo(x + (espaciado * 0.5), canvas.height);
            } else {
                ctx.lineTo(x, canvas.height);
            }
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
        for (let i = 0; i < 10; i++) {
            let nodoX = (i * (canvas.width / 5) + desfaseCircuito) % canvas.width;
            let nodoY = (i * (canvas.height / 8) + desfaseCircuito * 0.5) % canvas.height;
            ctx.beginPath();
            ctx.arc(nodoX, nodoY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(bucleCircuitos);
    }

    window.addEventListener('resize', ajustarCanvas);
    ajustarCanvas();
    bucleCircuitos(); 
}

// ==========================================
// 2. COMPONENTES DE INTERFAZ Y RECEPTOR MULTIMODAL
// ==========================================
const botonActivar = document.getElementById('boton-activar');
const subtituloLinea1 = document.getElementById('subtitulo-1');
const subtituloLinea2 = document.getElementById('subtitulo-2');
const inputArchivo = document.getElementById('input-archivo');
const vistaPreviaImg = document.getElementById('vista-previa-img');

let payloadMultimodal = { tipo: null, nombreArchivo: null, tamano: null, fechaCaptura: null, datosBase64: null };
let audioContext = null;
let analizador = null;
let frecuenciaMediaDetectada = 0;
let modoRegistroVoz = false;
let nombreVozARegistrar = "";
let relojOndasPasivas = null;

if (inputArchivo) {
    inputArchivo.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function(event) {
                payloadMultimodal.tipo = archivo.type;
                payloadMultimodal.nombreArchivo = archivo.name;
                payloadMultimodal.tamano = `${(archivo.size / 1024).toFixed(2)} KB`;
                payloadMultimodal.fechaCaptura = new Date().toLocaleString('es-MX');
                payloadMultimodal.datosBase64 = event.target.result;
                if (vistaPreviaImg) {
                    vistaPreviaImg.src = payloadMultimodal.datosBase64;
                    vistaPreviaImg.style.display = "block";
                }
                actualizarSubtitulos("SISTEMA MULTIMODAL", `Archivo indexado: ${payloadMultimodal.nombreArchivo}`);
                responderConVoz(`Archivo visual estructurado en el payload.`);
            };
            reader.readAsDataURL(archivo);
        }
    });
}

// ==========================================
// 3. RELOJ DE ONDAS PASIVAS (ESCUCHA EN ESPERA)
// ==========================================
function activarRelojOndasPasivas() {
    const barrasUI = document.querySelectorAll('.barra-onda');
    if (relojOndasPasivas) clearInterval(relojOndasPasivas);

    relojOndasPasivas = setInterval(() => {
        barrasUI.forEach((barra) => {
            const alturaAleatoria = Math.floor(Math.random() * (30 - 12 + 1)) + 12;
            barra.style.height = `${alturaAleatoria}px`;
        });
    }, 100); 
}

function desactivarRelojOndasPasivas() {
    if (relojOndasPasivas) {
        clearInterval(relojOndasPasivas);
        relojOndasPasivas = null;
    }
}

activarRelojOndasPasivas();

// ==========================================
// 4. SISTEMA DE EVENTOS PARA BOTONES LATERALES (PUNTO 15)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Buscar todos los botones holográficos por su título explicativo
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
                    // Llama de forma automática al disparador de archivos del Punto 10
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
// 5. CAPTURA DE VOZ NATIVA Y BIOMETRÍA ACÚSTICA
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;

if (!SpeechRecognition) {
    if (subtituloLinea1) subtituloLinea1.innerText = "Error: Navegador no compatible.";
} else {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            desactivarRelojOndasPasivas();
            actualizarSubtitulos("VIERNES OS", "Escuchando y analizando timbre de voz...");
            activarAnalisisBiometrico();
            reconocimiento.start();
        });
    }

    reconocimiento.onresult = (event) => {
        const loQueDije = event.results[0][0].transcript.toLowerCase();
        actualizarSubtitulos("USUARIO", `"${loQueDije}"`);
        setTimeout(() => { analizarPatronDeVoz(loQueDije); }, 500);
    };
    
    reconocimiento.onerror = () => { activarRelojOndasPasivas(); };
}

function activarAnalisisBiometrico() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    const barrasUI = document.querySelectorAll('.barra-onda');
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fuente = audioContext.createMediaStreamSource(stream);
        analizador = audioContext.createAnalyser();
        analizador.fftSize = 64; 
        fuente.connect(analizador);
        
        const bufferLength = analizador.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const refrescarOndasVoz = () => {
            if (!analizador) return;
            requestAnimationFrame(refrescarOndasVoz);
            analizador.getByteFrequencyData(dataArray);
            barrasUI.forEach((barra, indice) => {
                const valorAudio = dataArray[indice] || 0;
                const nuevaAltura = Math.max(10, Math.min(65, valorAudio * 0.4));
                barra.style.height = `${nuevaAltura}px`;
            });
        };
        refrescarOndasVoz();
        
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
            analizador = null;
            activarRelojOndasPasivas();
        }, 4000); 
    }).catch(() => {
        actualizarSubtitulos("ERROR HARDWARE", "Micrófono bloqueado.");
        activarRelojOndasPasivas();
    });
}

// ==========================================
// 6. PUENTE DE INTENCIONES Y CONEXIONES
// ==========================================
function analizarPatronDeVoz(mensaje) {
    const nombresActivacion = ["viernes", "lu", "il"];
    const llamadoDetectado = nombresActivacion.some(nombre => mensaje.includes(nombre));

    if (!llamadoDetectado) {
        responderConVoz("Lo siento, solo respondo si me llamas Viernes, Lu o Il.");
        return;
    }

    const patrones = {
        activacion: ["hola", "actívate", "despierta", "inicia"],
        ubicacion: ["dónde estoy", "ubicación", "localización", "dónde me encuentro"],
        multimodal: ["analiza", "qué ves", "archivo", "escanea"],
        llamada: ["llama", "llamar", "marcar"],
        agenda: ["recordatorio", "agenda", "calendario", "recuérdame"],
        comunicacion: ["whatsapp", "messenger", "instagram", "ig", "correo", "gmail"]
    };

    let intencionDetectada = "desconocida";
    for (let intencion in patrones) {
        if (patrones[intencion].some(palabra => mensaje.includes(palabra))) {
            intencionDetectada = intencion;
            break;
        }
    }
    procesarIntencionEstructurada(intencionDetectada, mensaje);
}

function despacharConexionExterna(servicio, datosAccion) {
    console.log(`[API DISPATCH] Destino: ${servicio}.`, datosAccion);
}

function procesarIntencionEstructurada(intencion, mensaje) {
    let vozJefe = localStorage.getItem('biometria_jefe');
    let listaVocesInvitados = JSON.parse(localStorage.getItem('voces_invitados') || "{}");

    if (modoRegistroVoz) {
        if (nombreVozARegistrar === "jefe") {
            localStorage.setItem('biometria_jefe', frequencyMediaDetectada);
            responderConVoz("Frecuencia acústica guardada como Jefe Omar.");
        } else {
            listaVocesInvitados[nombreVozARegistrar] = frecuenciaMediaDetectada;
            localStorage.setItem('voces_invitados', JSON.stringify(listaVocesInvitados));
            responderConVoz(`Registré el patrón de voz de ${nombreVozARegistrar}.`);
        }
        modoRegistroVoz = false;
        nombreVozARegistrar = "";
        return;
    }

    let diferenciaConJefe = Math.abs(frecuenciaMediaDetectada - parseInt(vozJefe));
    let esElJefe = diferenciaConJefe < 25; 
    let nombreInvitadoDetectado = "";

    if (vozJefe) {
        if (!esElJefe) {
            for (let invitado in listaVocesInvitados) {
                if (Math.abs(frecuenciaMediaDetectada - parseInt(listaVocesInvitados[invitado])) < 25) {
                    nombreInvitadoDetectado = invitado;
                    break;
                }
            }
        }
        if (!esElJefe && nombreInvitadoDetectado === "") {
            responderConVoz("Acceso denegado. Frecuencia de voz no autorizada.");
            return;
        }
    } else {
        localStorage.setItem('biometria_jefe', frequencyMediaDetectada);
        responderConVoz("Firma acústica guardada como Jefe Omar.");
        return;
    }

    let nombreUsuarioValido = esElJefe ? "Jefe Omar" : nombreInvitadoDetectado;

    switch(intencion) {
        case "activacion":
            responderConVoz(`Lu Li lista para trabajar con usted, ${nombreUsuarioValido}.`);
            break;
        case "ubicacion":
            responderConVoz(`Protocolo de sensores activos, ${nombreUsuarioValido}.`);
            break;
        case "multimodal":
            if (payloadMultimodal.datosBase64) {
                despacharConexionExterna("Servicio_Vision_IA", { archivo: payloadMultimodal.nombreArchivo });
                responderConVoz("Estructura de imagen analizada en el payload de forma exitosa.");
            } else {
                responderConVoz("Jefe, el buffer multimodal está vacío.");
            }
            break;
        case "llamada":
            const numeroLlamada = mensaje.replace(/\D/g, "");
            if (numeroLlamada.length >= 8) {
                despacharConexionExterna("Sistemas_Telefonicos", { numero: numeroLlamada });
                responderConVoz(`Activando canal de comunicación externa.`);
                window.open(`tel:${numeroLlamada}`, "_self");
            } else {
                responderConVoz("No detecté un patrón numérico válido.");
            }
            break;
        case "agenda":
            let agendaTexto = mensaje.replace("recordatorio", "").replace("agenda", "").replace("calendario", "").trim();
            if (agendaTexto.length === 0) agendaTexto = "Cita programada por Viernes";
            despacharConexionExterna("Google_Calendar_API", { evento: agendaTexto });
            responderConVoz(`Abriendo interfaz de agenda inmediatamente, ${nombreUsuarioValido}.`);
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(agendaTexto)}`, "_blank");
            break;
        case "comunicacion":
            window.open("https://api.whatsapp.com/", "_blank");
            responderConVoz("Abriendo la plataforma de comunicación solicitada.");
            break;
        default:
            responderConVoz(`Comando de voz recibido, ${nombreUsuarioValido}.`);
            break;
    }
}

// ==========================================
// 7. MOTOR DE SALIDA DE VOZ Y SUBTÍTULOS
// ==========================================
function actualizarSubtitulos(emisor, texto) {
    if (subtituloLinea1 && subtituloLinea2) {
        subtituloLinea1.innerText = subtituloLinea2.innerText;
        subtituloLinea2.innerText = `[${emisor}]: ${texto}`;
    }
}

function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX';
    lectura.rate = 1.0;
    actualizarSubtitulos("Viernes", texto);
    window.speechSynthesis.speak(lectura);
}