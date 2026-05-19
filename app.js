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

// PROTOCOLO DE IDENTIDAD, SENSORES Y RESPUESTA
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
        
        // 3. OBLIGATORIO: Conciencia de Datos (Sensores y Ubicación)
        else if (mensaje.includes("dónde estoy") || mensaje.includes("ubicación") || mensaje.includes("localización")) {
            textoEstado.innerText = "Accediendo a los sensores de ubicación...";
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (posicion) => {
                        const latitud = posicion.coords.latitude.toFixed(4);
                        const longitud = posicion.coords.longitude.toFixed(4);
                        respuesta = `Jefe, según los sensores de su dispositivo, su ubicación actual es latitud ${latitud} y longitud ${longitud}. Sistema rastreado correctamente.`;
                        responderConVoz(respuesta);
                    },
                    (error) => {
                        respuesta = "Jefe, no pude acceder a los sensores de ubicación. Por favor, verifique los permisos de su navegador.";
                        responderConVoz(respuesta);
                    }
                );
            } else {
                respuesta = "Este dispositivo no cuenta con sensores de geolocalización disponibles, Jefe.";
                responderConVoz(respuesta);
            }
        }
        
        // 4. OBLIGATORIO: Protocolo de Veracidad (Simulación de búsqueda en tiempo real)
        else if (mensaje.includes("busca") || mensaje.includes("investiga") || mensaje.includes("clima")) {
            respuesta = "Iniciando Protocolo de Veracidad. Conectando con los servidores de búsqueda en tiempo real para evitar alucinaciones... Buscando información actualizada al segundo para usted, Jefe Omar.";
            responderConVoz(respuesta);
            // Nota: En el siguiente paso conectaremos esto a una API real de internet
        }
        
        // Si no detecta una orden exacta
        else {
            respuesta = "Entendido Jefe, procesé su llamado pero esa función requiere conexión avanzada. Vamos paso a paso.";
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