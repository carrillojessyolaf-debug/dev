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
// 2. CONFIGURACIÓN DE LA CAPA DE ORQUESTACIÓN (GEMINI API)
// ==========================================
const GEMINI_API_KEY = "TU_GEMINI_API_KEY"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Definición de Herramientas Especialistas disponibles para la IA (Function Calling)
const herramientasViernes = [{
    functionDeclarations: [
        {
            name: "controlarAgenda",
            description: "Registra recordatorios o abre el calendario para gestionar citas del usuario.",
            parameters: {
                type: "OBJECT",
                properties: { asunto: { type: "STRING", description: "Descripción del evento o recordatorio." } },
                required: ["asunto"]
            }
        },
        {
            name: "ejecutarEnlaceTelefonico",
            description: "Extrae un número de teléfono y realiza una llamada externa.",
            parameters: {
                type: "OBJECT",
                properties: { numero: { type: "STRING", description: "El número telefónico extraído del comando." } },
                required: ["numero"]
            }
        },
        {
            name: "abrirPuenteMensajeria",
            description: "Abre plataformas externas de comunicación (WhatsApp, correo, etc.).",
            parameters: {
                type: "OBJECT",
                properties: { plataforma: { type: "STRING", description: "Ej. whatsapp, gmail, instagram." } },
                required: ["plataforma"]
            }
        }
    ]
}];

// Instrucciones del Sistema para definir la personalidad de Viernes
const instruccionesSistema = "Eres Viernes (también respondes a Lu o Il), una interfaz de inteligencia artificial holográfica militar avanzada instalada en el dispositivo móvil del Jefe Omar. Tus respuestas deben ser sumamente profesionales, concisas, estratégicas y con un toque de sofisticación cibernética. Tienes acceso a herramientas externas mediante llamadas a funciones que debes invocar de forma proactiva si el comando lo requiere.";

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
                payloadMultimodal.datosBase64 = base64Completo.split(',')[1]; // Limpiar encabezado data:image/...
                
                if (vistaPreviaImg) {
                    vistaPreviaImg.src = base64Completo; vistaPreviaImg.style.display = "block";
                }
                actualizarSubtitulos("SISTEMA MULTIMODAL", `Imagen indexada en memoria: ${archivo.name}`);
                responderConVoz("Jefe Omar, sensor óptico cargado en el payload. Listo para análisis visual.");
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
// 4. CAPA DE ORQUESTACIÓN CENTRAL (PETICIÓN API)
// ==========================================
async function procesarComandoConIA(mensajeUsuario) {
    actualizarSubtitulos("VIERNES OS", "Pensando y estructurando respuesta...");
    
    // Construir el cuerpo de la solicitud para Gemini
    let contenidoPeticion = { parts: [{ text: mensajeUsuario }] };

    // CAPA MULTIMODAL REAL: Si hay una imagen en el payload, se adjunta en paralelo
    if (payloadMultimodal.datosBase64) {
        contenidoPeticion.parts.push({
            inlineData: {
                mimeType: payloadMultimodal.mimeType,
                data: payloadMultimodal.datosBase64
            }
        });
        // Limpiamos el buffer para la próxima captura
        payloadMultimodal = { mimeType: null, datosBase64: null, nombreArchivo: null };
        if (vistaPreviaImg) vistaPreviaImg.style.display = "none";
    }

    const payloadCompleto = {
        contents: [contenidoPeticion],
        tools: herramientasViernes,
        systemInstruction: { parts: [{ text: instruccionesSistema }] }
    };

    try {
        const respuesta = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadCompleto)
        });

        const data = await respuesta.json();
        const parteRespuesta = data.candidates[0].content.parts[0];

        // EVALUACIÓN DE FUNCTION CALLING (¿La IA decidió usar una herramienta?)
        if (parteRespuesta.functionCall) {
            const nombreFuncion = parteRespuesta.functionCall.name;
            const argumentos = parteRespuesta.functionCall.args;
            ejecutarHerramientaEspecialista(nombreFuncion, argumentos);
        } else if (parteRespuesta.text) {
            // Respuesta conversacional directa
            responderConVoz(parteRespuesta.text);
        }
    } catch (error) {
        console.error("Error de Orquestación:", error);
        actualizarSubtitulos("ERROR CRÍTICO", "Fallo en el enlace con el cerebro de IA.");
    }
}

// ==========================================
// 5. CAPA DE AGENTES ESPECIALISTAS (EJECUCIÓN REAL)
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
// 6. ESCUCHA ACTIVA AUTÓNOMA CONTINUA (WAKE WORD)
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
        
        // El orquestador evalúa si llamaste al sistema operativo
        const nombresActivacion = ["viernes", "lu", "il"];
        if (nombresActivacion.some(nombre => loQueDije.includes(nombre))) {
            actualizarSubtitulos("USUARIO", `"${loQueDije}"`);
            desactivarRelojOndasPasivas();
            activarAnalisisBiometrico();
            
            // Envío directo al cerebro inteligente de Gemini
            procesarComandoConIA(loQueDije);
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
// 7. SALIDA DE AUDIO Y LOGS HISTÓRICOS
// ==========================================
function actualizarSubtitulos(emisor, texto) {
    if (subtituloLinea1 && subtituloLinea2) {
        subtituloLinea1.innerText = subtituloLinea2.innerText;
        subtituloLinea2.innerText = `[${emisor}]: ${texto}`;
        const panelContenedor = document.querySelector('.panel-subtitulos');
        if (panelContenedor) panelContenedor.scrollTop = panelContenedor.scrollHeight;
    }
}

function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX'; lectura.rate = 1.0;
    actualizarSubtitulos("Viernes", texto);
    window.speechSynthesis.speak(lectura);
}