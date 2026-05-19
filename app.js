// ==========================================
// 1. MOTOR GRÁFICO DEL CANVAS (CIRCUITOS ADAPTATIVOS S20)
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
let wakeLock = null; // Guardará el bloqueo de apagado de pantalla

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
// 3. RELOJ DE ONDAS PASIVAS (ESCUCHA EN ESPERA 0.1s)
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
// 4. OPTIMIZACIÓN 1: PREVENIR APAGADO DE PANTALLA (WAKE LOCK)
// ==========================================
async function solicitarWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("[WAKE LOCK ACTIVO]: El S20 no apagará la pantalla.");
        } catch (err) {
            console.log(`Fallo al bloquear apagado de pantalla: ${err.message}`);
        }
    }
}
// Forzar encendido permanente al cargar la app y al regresar a la pestaña
solicitarWakeLock();
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        solicitarWakeLock();
    }
});

// ==========================================
// 5. SISTEMA DE EVENTOS PARA BOTONES LATERALES
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
// 6. OPTIMIZACIÓN 2: ESCUCHA ACTIVA AUTÓNOMA CONTINUA (WAKE WORD)
// ==========================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;

if (!SpeechRecognition) {
    if (subtituloLinea1) subtituloLinea1.innerText = "Error: Navegador no compatible.";
} else {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX';
    reconocimiento.continuous = true; // El micrófono NO se apaga, se queda escuchando siempre
    reconocimiento.interimResults = false;

    // Arrancar el reconocimiento automáticamente en segundo plano para que sea manos libres
    window.addEventListener('load', () => {
        try { reconocimiento.start(); } catch(e) {}
    });

    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            desactivarRelojOndasPasivas();
            actualizarSubtitulos("VIERNES OS", "Escuchando y analizando timbre de voz...");
            activarAnalisisBiometrico();
            try { reconocimiento.start(); } catch(e) {}
        });
    }

    reconocimiento.onresult = (event) => {
        // Capturar la última frase dicha por el usuario en el flujo continuo
        const indiceUltimoResult = event.results.length - 1;
        const loQueDije = event.results[indiceUltimoResult][0].transcript.toLowerCase().trim();
        
        actualizarSubtitulos("USUARIO", `"${loQueDije}"`);
        analizarPatronDeVoz(loQueDije);
    };
    
    // Si el motor web del navegador corta el micrófono por inactividad, forzamos su auto-encendido instantáneo
    reconocimiento.onend = () => {
        try { reconocimiento.start(); } catch(e) {}
    };
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
        }, 3000); 
    }).catch(() => {
        activarRelojOndasPasivas();
    });
}

// ==========================================
// 7. PUENTE DE INTENCIONES BIOMÉTRICAS
// ==========================================
function analizarPatronDeVoz(mensaje) {
    const nombresActivacion = ["viernes", "lu", "il"];
    const llamadoDetectado = nombresActivacion.some(nombre => mensaje.includes(nombre));

    // Si el micrófono continuo escucha una plática normal y nadie llama a la IA, ignora el texto
    if (!llamadoDetectado) return;

    // Activa la biometría visual en las barras solo al detectar la Wake Word
    desactivarRelojOndasPasivas();
    activarAnalisisBiometrico();

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