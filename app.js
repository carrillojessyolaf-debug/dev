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
        textoEstado.innerText = `Dijiste: "${loQueDije}"`;
        botonActivar.style.borderColor = "#00ffcc";
        botonActivar.style.boxShadow = "0 0 20px #00ffcc";
        
        procesarOrden(loQueDije);
    };

    reconocimiento.onerror = () => {
        textoEstado.innerText = "No te escuché bien. Presiona de nuevo.";
        botonActivar.style.borderColor = "#00ffcc";
    };
}

// PROTOCOLO DE IDENTIDAD, SENSORES Y EJECUCIÓN DE TAREAS
function procesarOrden(mensaje) {
    let respuesta = "";

    // Verificar si llamaste a Viernes, Lu o Il
    if (mensaje.includes("viernes") || mensaje.includes("lu") || mensaje.includes("il")) {
        
        // 1. OBLIGATORIO: Frases de Activación
        if (mensaje.includes("hola") || mensaje.includes("actívate") || mensaje.includes("despierta")) {
            const frases = [
                "Lu Li lista para trabajar con usted, ¿qué haremos hoy?",
                "Jefe, estoy lista para el show... ¿Qué procede?"
            ];
            respuesta = frases[Math.floor(Math.random() * frases.length)];
            responderConVoz(respuesta);
        } 
        
        // 2. OBLIGATORIO: Saludo Completo
        else if (mensaje.includes("salúdame") || mensaje.includes("saludo")) {
            const ahora = new Date();
            const horas = ahora.getHours();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
            const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            
            let momentoDia = "Buenos días";
            if (horas >= 12 && horas < 19) momentoDia = "Buenas tardes";
            if (horas >= 19 || horas < 6) momentoDia = "Buenas noches";

            respuesta = `${momentoDia} Jefe Omar. Hoy es ${fechaActual} y son las ${horaActual}.`;
            responderConVoz(respuesta);
        }
        
        // 3. OBLIGATORIO: Conciencia de Datos (Ubicación)
        else if (mensaje.includes("dónde estoy") || mensaje.includes("ubicación") || mensaje.includes("localización")) {
            textoEstado.innerText = "Accediendo a los sensores de ubicación...";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((posicion) => {
                    const latitud = posicion.coords.latitude.toFixed(4);
                    const longitud = posicion.coords.longitude.toFixed(4);
                    respuesta = `Jefe, según los sensores de su dispositivo, su ubicación actual es latitud ${latitud} y longitud ${longitud}.`;
                    responderConVoz(respuesta);
                }, () => {
                    respuesta = "Jefe, no pude acceder a los sensores de ubicación. Verifique los permisos.";
                    responderConVoz(respuesta);
                });
            } else {
                respuesta = "Este dispositivo no cuenta con sensores de geolocalización, Jefe.";
                responderConVoz(respuesta);
            }
        }
        
        // 4. OBLIGATORIO: Ejecución de Tareas - Abrir WhatsApp
        else if (mensaje.includes("whatsapp") || mensaje.includes("mensaje")) {
            respuesta = "Abriendo la interfaz de WhatsApp para usted, Jefe.";
            responderConVoz(respuesta);
            // Esto abrirá la app en tu cel o la web en tu compu automáticamente
            window.open("https://api.whatsapp.com/", "_blank");
        }

        // 5. OBLIGATORIO: Ejecución de Tareas - Google Calendar (Recordatorios)
        else if (mensaje.includes("calendario") || mensaje.includes("agenda") || mensaje.includes("recordatorio")) {
            respuesta = "Entendido Jefe. Abriendo su Google Calendar para agendar el evento inmediatamente.";
            responderConVoz(respuesta);
            window.open("https://calendar.google.com/", "_blank");
        }

        // 6. OBLIGATORIO: Ejecución de Tareas - Correo Gmail
        else if (mensaje.includes("correo") || mensaje.includes("gmail")) {
            respuesta = "Accediendo a su bandeja de correo de Gmail, Jefe.";
            responderConVoz(respuesta);
            window.open("https://mail.google.com/", "_blank");
        }
        
        // Si no detecta una orden exacta
        else {
            respuesta = "Entendido Jefe Omar, procesé su llamado. Añadiendo esta nueva petición al historial de desarrollo paso a paso.";
            responderConVoz(respuesta);
        }

    } else {
        respuesta = "Lo siento, solo respondo si me llamas Viernes, Lu o Il.";
        responderConVoz(respuesta);
    }
}

// Sintetizador de voz
function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX';
    lectura.rate = 1.0;
    textoEstado.innerText = texto;
    window.speechSynthesis.speak(lectura);
}