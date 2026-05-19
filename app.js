// Elementos de la interfaz de pantalla
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');

// Configuración del sistema de reconocimiento de voz nativo
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

// PROTOCOLO PRINCIPAL: PROCESADOR DE ÓRDENES Y CONCIENCIA DE DATOS
function procesarOrden(mensaje) {
    let respuesta = "";

    // Filtro de seguridad: Verificar si llamaste a Viernes, Lu o Il
    if (mensaje.includes("viernes") || mensaje.includes("lu") || mensaje.includes("il")) {
        
        // 1. PROTOCOLO DE IDENTIDAD Y ACTIVACIÓN
        if (mensaje.includes("hola") || mensaje.includes("actívate") || mensaje.includes("despierta") || mensaje.includes("inicia")) {
            const frasesDeActivacion = [
                "Lu Li lista para trabajar con usted, ¿qué haremos hoy?",
                "Jefe, estoy lista para el show... ¿Qué procede?"
            ];
            respuesta = frasesDeActivacion[Math.floor(Math.random() * frasesDeActivacion.length)];
            responderConVoz(respuesta);
        } 
        
        // 2. PROTOCOLO DE SALUDO CONDICIONAL
        else if (mensaje.includes("salúdame") || mensaje.includes("saludo") || mensaje.includes("buenos días") || mensaje.includes("buenas tardes") || mensaje.includes("buenas noches")) {
            const ahora = new Date();
            const horas = ahora.getHours();
            
            let momentoDia = "Buenos días";
            if (horas >= 12 && horas < 19) momentoDia = "Buenas tardes";
            if (horas >= 19 || horas < 6) momentoDia = "Buenas noches";

            respuesta = `${momentoDia}, Jefe Omar.`;

            // Agregar fecha y hora solo si se la pide explícitamente
            if (mensaje.includes("hora") || mensaje.includes("fecha")) {
                const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
                const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                
                respuesta += ` Actualmente es ${fechaActual} y el reloj marca las ${horaActual}.`;
            }

            responderConVoz(respuesta);
        }
        
        // 3. PROTOCOLO OBLIGATORIO: CONCIENCIA DE DATOS (Acceso total a Sensores)
        else if (mensaje.includes("dónde estoy") || mensaje.includes("ubicación") || mensaje.includes("localización") || mensaje.includes("sensores")) {
            textoEstado.innerText = "Accediendo a los sensores del dispositivo...";
            
            // Captura de datos de tiempo del sistema al segundo
            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
            const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            // Intento de conexión con el sensor GPS/Geolocalización
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (posicion) => {
                        const latitud = posicion.coords.latitude.toFixed(6);
                        const longitud = posicion.coords.longitude.toFixed(6);
                        
                        // Respuesta integrada con todos los sensores solicitados
                        respuesta = `Entendido Jefe. Accediendo a la conciencia de datos: Hoy es ${fechaActual}, hora exacta: ${horaActual}. Sus sensores de posicionamiento global reportan una latitud de ${latitud} y una longitud de ${longitud}. Localización completada, Omar.`;
                        responderConVoz(respuesta);
                    }, 
                    (error) => {
                        // En caso de que el navegador tenga los permisos de GPS bloqueados
                        respuesta = `Jefe Omar, accedí al reloj interno: son las ${horaActual}, pero los sensores de ubicación del dispositivo están bloqueados o sin permisos de acceso.`;
                        responderConVoz(respuesta);
                    }
                );
            } else {
                respuesta = `Jefe, el reloj marca las ${horaActual}, pero este dispositivo físico no cuenta con hardware o sensores de geolocalización disponibles en el sistema.`;
                responderConVoz(respuesta);
            }
        }
        
        // 4. EJECUCIÓN DE TAREAS - ENLACES DE INTEGRACIÓN
        else if (mensaje.includes("whatsapp") || mensaje.includes("mensaje")) {
            respuesta = "Abriendo la interfaz de WhatsApp para usted, Jefe.";
            responderConVoz(respuesta);
            window.open("https://api.whatsapp.com/", "_blank");
        }
        else if (mensaje.includes("calendario") || mensaje.includes("agenda") || mensaje.includes("recordatorio")) {
            respuesta = "Entendido Jefe. Abriendo su Google Calendar para agendar el evento inmediatamente.";
            responderConVoz(respuesta);
            window.open("https://calendar.google.com/", "_blank");
        }
        else if (mensaje.includes("correo") || mensaje.includes("gmail")) {
            respuesta = "Accediendo a su bandeja de correo de Gmail, Jefe.";
            responderConVoz(respuesta);
            window.open("https://mail.google.com/", "_blank");
        }