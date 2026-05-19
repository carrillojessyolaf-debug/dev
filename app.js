// Elementos de la interfaz de pantalla
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');
const inputArchivo = document.getElementById('input-archivo');
const vistaPreviaImg = document.getElementById('vista-previa-img');

let imagenCargadaBase64 = null;

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
            
            // Iniciar captura física de frecuencias de audio
            activarAnalisisBiometrico();
            reconocimiento.start();
        });
    }

    reconocimiento.onresult = (event) => {
        const loQueDije = event.results[0][0].transcript.toLowerCase();
        textoEstado.innerText = `Dijeste: "${loQueDije}"`;
        botonActivar.style.borderColor = "#00ffcc";
        botonActivar.style.boxShadow = "0 0 20px #00ffcc";
        
        // Detener el análisis de hardware para procesar los datos
        setTimeout(() => {
            procesarVozYOrden(loQueDije);
        }, 500);
    };
}

// FUNCIÓN DE HARDWARE: Analiza las frecuencias físicas del micrófono
function activarAnalisisBiometrico() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fuente = audioContext.createMediaStreamSource(stream);
        analizador = audioContext.createAnalyser();
        analizador.fftSize = 256;
        fuente.connect(analizador);
        
        const bufferLength = analizador.frequencyBinCount;
        const dataArray = new Uint8Array(