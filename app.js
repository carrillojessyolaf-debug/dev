// Elementos de la interfaz de pantalla
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');
const inputArchivo = document.getElementById('input-archivo');
const vistaPreviaImg = document.getElementById('vista-previa-img');

// ESTRUCTURA DE ALMACENAMIENTO MULTIMODAL (PUNTO 10)
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
            procesarVozYOrden(loQueDije);
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

// RECEPTOR Y PROCESADOR MULTIMODAL ESTRUCTURADO (PUNTO 10)
if (inputArchivo) {
    inputArchivo.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            textoEstado.innerText = "Estructurando archivo multimedia...";
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Rellenar la estructura formal para el procesamiento del futuro
                payloadMultimodal.tipo = archivo.type;
                payloadMultimodal.nombreArchivo = archivo.name;
                payloadMultimodal.tamano = `${(archivo.size / 1024).toFixed(2)} KB`;
                payloadMultimodal.fechaCaptura = new Date().toLocaleString('es-MX');
                payloadMultimodal.datosBase64 = event.target.result;
                
                // Mostrar miniatura en interfaz
                vistaPreviaImg.src = payloadMultimodal.datosBase64;
                vistaPreviaImg.style.display = "block";
                
                textoEstado.innerText = "Estructura lista. Archivo indexado correctamente.";
                
                // Responder confirmando la metadata del archivo cargado
                responderConVoz(`Jefe Omar, he recibido y estructurado el archivo: ${payloadMultimodal.nombreArchivo}. El payload de ${payloadMultimodal.tamano} está listo en memoria para su procesamiento analítico futuro.`);
            };
            reader.readAsDataURL(archivo);
        }
    });
}

// PROTOCOLO COGNITIVO PRINCIPAL
function procesarVozYOrden(mensaje) {
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

    if (!vozJefe) {
        localStorage.setItem('biometria_jefe', frecuenciaMediaDetectada);
        responderConVoz("Hola. No detecto registros previos. He guardado su tono de voz como el perfil del Jefe Omar de forma automática.");
        return;
    }

    let diferenciaConJefe = Math.abs(frecuenciaMediaDetectada - parseInt(vozJefe));
    let esElJefe = diferenciaConJefe < 25; 
    let nombreInvitadoDetectado = "";

    if (!esElJefe) {
        for (let invitado in listaVocesInvitados) {
            let difInvitado = Math.abs(frec