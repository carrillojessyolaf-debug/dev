// Elementos de la pantalla
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');

// Configuración del sistema de reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    textoEstado.innerText = "Tu navegador no soporta comandos de voz.";
} else {
    const reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            textoEstado.innerText = "Escuchando...";
            botonActivar.style.borderColor = "#ff0055";
            botonActivar.style.boxShadow = "0 0 20px #ff0055";
            reconocimiento.start();
        });
    }

    reconocimiento.onresult = (event) => {
        const loQueDije = event.results[0][0].transcript.toLowerCase();
        textoEstado.innerText = `Dijeste: "${loQueDije}"`;
        botonActivar.style.borderColor = "#00ffcc";
        botonActivar.style.boxShadow = "0 0 20px #00ffcc";
        
        procesarOrden(loQueDije);
    };

    reconocimiento.onerror = () => {
        textoEstado.innerText = "No te escuché bien. Presiona de nuevo.";
        botonActivar.style.borderColor = "#00ffcc";
    };
}

// PROTOCOLO DE IDENTIDAD, SENSORES Y SALUDOS OBLIGATORIOS
function procesarOrden(mensaje) {
    let respuesta = "";

    // Verificar si llamaste a Viernes, Lu o Il
    if (mensaje.includes("viernes") || mensaje.includes("lu") || mensaje.includes("il")) {
        
        // 1. OBLIGATORIO: Frases de Activación Inicial
        if (mensaje.includes("hola") || mensaje.includes("actívate") || mensaje.includes("despierta")) {
            const frases = [
                "Lu Li lista para trabajar con usted, ¿qué haremos hoy?",
                "Jefe, estoy lista para el show... ¿Qué procede?"
            ];
            respuesta = frases[Math.floor(Math.random() * frases.length)];
            responderConVoz(respuesta);
        } 
        
        // 2. PROTOCOLO OBLIGATORIO DE SALUDO (Modificado según sus especificaciones)
        else if (mensaje.includes("salúdame") || mensaje.includes("saludo") || mensaje.includes("buenos días") || mensaje.includes("buenas tardes") || mensaje.includes("buenas noches")) {
            const ahora = new Date();
            const horas = ahora.getHours();
            
            // Determinar si es mañana, tarde o noche
            let momentoDia = "Buenos días";
            if (horas >= 12 && horas < 19) momentoDia = "Buenas tardes";
            if (horas >= 19 || horas < 6) momentoDia = "Buenas noches";

            // Saludo base obligatorio
            respuesta = `${momentoDia}, Jefe Omar.`;

            // AGREGAR FECHA Y HORA SOLO SI SE LA PIDE EXPLÍCITAMENTE
            if (mensaje.includes("hora") || mensaje.includes("fecha")) {
                const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
                const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                
                respuesta += ` Actualmente es ${fechaActual} y el reloj marca las ${horaActual}.`;
            }

            responderConVoz(respuesta);
        }
        
        // 3. OBLIGATORIO: Conciencia de Datos (Ubicación)
        else if (mensaje.includes("dónde estoy") || mensaje.includes("ubicación") || mensaje.includes("localización")) {
            textoEstado.innerText = "Accediendo a los sensores de ubicación...";
            if (navigator.geolocation) {
                navigator.geolocation.