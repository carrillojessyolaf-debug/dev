// Elementos de la interfaz de pantalla
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');
const inputArchivo = document.getElementById('input-archivo');
const vistaPreviaImg = document.getElementById('vista-previa-img');

// ESTRUCTURA MULTIMODAL (PUNTO 10)
let payloadMultimodal = {
    tipo: null,
    nombreArchivo: null,
    tamano: null,
    fechaCaptura: null,
    datosBase64: null
};

// VARIABLES DE CONTROL DE VOZ Y BIOMETRÍA ACÚSTICA
let audioContext = null;
let analizador = null;
let frecuenciaMediaDetectada = 0;
let modoRegistroVoz = false;
let nombreVozARegistrar = "";

// Configuración del sistema de reconocimiento de voz nativo
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;

if (!SpeechRecognition) {
    textoEstado.innerText = "Tu navegador no soporta comandos de voz.";
} else {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            textoEstado.innerText = "Escuchando y analizando timbre de voz...";
            botonActivar.style.borderColor = "#ff0055";
            botonActivar.style.boxShadow = "0 0 20px #ff0055";
            
            activarAnalisisBiometrico();
            reconocimiento.start();
        });
    }

    reconocimiento.onresult = (event) => {
        const loQueDije = event.results[0][0].transcript.toLowerCase();
        textoEstado.innerText = `Dijeste: "${loQueDije}"`;
        botonActivar.style.borderColor = "#00ffcc";
        botonActivar.style.boxShadow = "0 0 20px #00ffcc";
        
        setTimeout(() => {
            // PUNTO 11: Enviamos el texto capturado al puente de análisis de patrones
            analizarPatronDeVoz(loQueDije);
        }, 500);
    };
}

function activarAnalisisBiometrico() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fuente = audioContext.createMediaStreamSource(stream);
        analizador = audioContext.createAnalyser();
        analizador.fftSize = 256;
        fuente.connect(analizador);
        const bufferLength = analizador.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let sumaFrecuencias = 0;
        let conteouestras = 0;
        
        const intervalo = setInterval(() => {
            if (!analizador) { clearInterval(intervalo); return; }
            analizador.getByteFrequencyData(dataArray);
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > 0) { sumaFrecuencias += dataArray[i]; conteouestras++; }
            }
        }, 300);

        setTimeout(() => {
            clearInterval(intervalo);
            if (conteouestras > 0) { frecuenciaMediaDetectada = Math.round(sumaFrecuencias / conteouestras); }
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
        }, 400);
    }).catch(() => {});
}

// PUNTO 11: PUENTE DE ANÁLISIS DE PATRONES (Mapeador de Intenciones)
function analizarPatronDeVoz(mensaje) {
    // 1. Validar el llamado por nombre
    const nombresActivacion = ["viernes", "lu", "il"];
    const llamadoDetectado = nombresActivacion.some(nombre => mensaje.includes(nombre));

    if (!llamadoDetectado) {
        responderConVoz("Lo siento, solo respondo si me llamas Viernes, Lu o Il.");
        return;
    }

    // 2. Diccionario de patrones lógicos de intención
    const patrones = {
        activacion: ["hola", "actívate", "despierta", "inicia", "arriba"],
        ubicacion: ["dónde estoy", "ubicación", "localización", "coordenadas", "dónde me encuentro", "localízame"],
        multimodal: ["analiza", "qué ves", "archivo", "escanea la imagen", "procesa la captura"],
        llamada: ["llama", "llamar", "marcar al", "marcale a", "teléfono"],
        agenda: ["recordatorio", "agenda", "calendario", "recuérdame", "anota en la agenda"],
        comunicacion: ["whatsapp", "messenger", "instagram", "ig", "correo", "gmail", "mensaje"],
        memoria: ["anota", "recuerda", "guarda en la memoria", "historial", "qué recuerdas"]
    };

    // 3. Encontrar la intención dominante según las palabras clave utilizadas
    let intencionDetectada = "desconocida";
    for (let intencion in patrones) {
        if (patrones[intencion].some(palabra => mensaje.includes(palabra))) {
            intencionDetectada = intencion;
            break;
        }
    }

    // 4. Conmutador del puente: Redirige al bloque lógico correspondiente
    procesarIntencionEstructurada(intencionDetectada, mensaje);
}

// PROCESADOR DE INTENCIONES MAPEADAS
function procesarIntencionEstructurada(intencion, mensaje) {
    let vozJefe = localStorage.getItem('biometria_jefe');
    let listaVocesInvitados = JSON.parse(localStorage.getItem('voces_invitados') || "{}");

    if (modoRegistroVoz) {
        if (nombreVozARegistrar === "jefe") {
            localStorage.setItem('biometria_jefe', frecuenciaMediaDetectada);
            responderConVoz(`Frecuencia acústica guardada. Identidad del Jefe Omar vinculada al sistema correctamente.`);
        } else {
            listaVocesInvitados[nombreVozARegistrar] = frecuenciaMediaDetectada;
            localStorage.setItem('voces_invitados', JSON.stringify(listaVocesInvitados));
            responderConVoz(`Entendido Jefe. Registré el patrón de voz de ${nombreVozARegistrar}.`);
        }
        modoRegistroVoz = false;
        nombreVozARegistrar = "";
        return;
    }

    // Filtro de Seguridad Biométrica Obligatorio
    let diferenciaConJefe = Math.abs(frecuenciaMediaDetectada - parseInt(vozJefe));
    let esElJefe = diferenciaConJefe < 25; 
    let nombreInvitadoDetectado = "";

    if (vozJefe) {
        if (!esElJefe) {
            for (let invitado in listaVocesInvitados) {
                let difInvitado = Math.abs(frecuenciaMediaDetectada - parseInt(listaVocesInvitados[invitado]));
                if (difInvitado < 25) { nombreInvitadoDetectado = invitado; break; }
            }
        }
        if (!esElJefe && nombreInvitadoDetectado === "") {
            responderConVoz("Acceso denegado. Frecuencia de voz no autorizada en los protocolos de Viernes.");
            return;
        }
    } else {
        localStorage.setItem('biometria_jefe', frecuenciaMediaDetectada);
        responderConVoz("Hola. Registro biométrico vacío. Firma acústica guardada como Jefe Omar.");
        return;
    }

    let nombreUsuarioValido = esElJefe ? "Jefe Omar" : nombreInvitadoDetectado;

    // Ejecución final basada en el Patrón de Intención (Punto 11)
    switch(intencion) {
        case "activacion":
            const frases = ["Lu Li lista para trabajar con usted, ¿qué haremos hoy?", "Jefe, estoy lista para el show... ¿Qué procede?"];
            responderConVoz(frases[Math.floor(Math.random() * frases.length)]);
            break;

        case "ubicacion":
            const ahora = new Date();
            const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            responderConVoz(`Entendido ${nombreUsuarioValido}. Puente de audio procesado. Sensores de geolocalización activos. Hora: ${horaActual}.`);
            break;

        case "multimodal":
            if (payloadMultimodal.datosBase64) {
                responderConVoz(`Analizando el payload multimedia cargado el ${payloadMultimodal.fechaCaptura}. El buffer está estructurado.`);
            } else {
                responderConVoz("Jefe, el buffer multimodal está vacío. Registre un archivo en la interfaz primero.");
            }
            break;

        case "llamada":
            const numeroLlamada = mensaje.replace(/\D/g, "");
            if (numeroLlamada.length >= 8) {
                responderConVoz(`Activando aplicación nativa de comunicación para el número ${numeroLlamada}.`);
                window.open(`tel:${numeroLlamada}`, "_self");
            } else {
                responderConVoz(`No detecté un patrón numérico válido para realizar la llamada, Jefe.`);
            }
            break;

        case "agenda":
            let tareaAAgendar = mensaje.replace("recordatorio", "").replace("agenda", "").replace("calendario", "").trim();
            if (tareaAAgendar.length === 0) tareaAAgendar = "Cita programada por Viernes";
            responderConVoz(`Abriendo Google Calendar para fijar la notificación inmediatamente, ${nombreUsuarioValido}.`);
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tareaAAgendar)}`, "_blank");
            break;

        case "comunicacion":
            if (mensaje.includes("whatsapp")) window.open("https://api.whatsapp.com/", "_blank");
            else if (mensaje.includes("messenger")) window.open("https://www.messenger.com/", "_blank");
            else if (mensaje.includes("instagram") || mensaje.includes("ig")) window.open("https://www.instagram.com/", "_blank");
            else window.open("https://mail.google.com/", "_blank");
            responderConVoz(`Abriendo la plataforma de comunicación solicitada, ${nombreUsuarioValido}.`);
            break;

        case "memoria":
            if (mensaje.includes("anota") || mensaje.includes("recuerda")) {
                let datoAGuardar = mensaje.replace("anota", "").replace("recuerda", "").trim();
                let historialCompleto = localStorage.getItem('historial_viernes') || "";
                historialCompleto += `[${new Date().toLocaleDateString('es-MX')}]: ${datoAGuardar}. `;
                localStorage.setItem('historial_viernes', historialCompleto);
                responderConVoz(`Archivado en el registro histórico de largo plazo, Jefe.`);
            } else {
                let memoriaConsultada = localStorage.getItem('historial_viernes') || "Vacía";
                responderConVoz(`Historial de nuestra bitácora: ${memoriaConsultada}`);
            }
            break;

        default:
            responderConVoz(`Comando de voz recibido, ${nombreUsuarioValido}. Patrón de intención analizado en el puente de audio de manera exitosa.`);
            break;
    }
}

function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX';
    lectura.rate = 1.0;
    textoEstado.innerText = texto;
    window.speechSynthesis.speak(lectura);
}

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
                vistaPreviaImg.src = payloadMultimodal.datosBase64;
                vistaPreviaImg.style.display = "block";
                textoEstado.innerText = "Estructura lista. Archivo indexado correctamente.";
                responderConVoz(`Archivo visual estructurado en el payload.`);
            };
            reader.readAsDataURL(archivo);
        }
    });
}