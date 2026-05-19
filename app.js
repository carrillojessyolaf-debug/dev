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

            if (mensaje.includes("hora") || mensaje.includes("fecha")) {
                const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
                const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                
                respuesta += ` Actualmente es ${fechaActual} y el reloj marca las ${horaActual}.`;
            }

            responderConVoz(respuesta);
        }
        
        // 3. PROTOCOLO: CONCIENCIA DE DATOS (Acceso a Sensores Básicos)
        else if (mensaje.includes("dónde estoy") || mensaje.includes("ubicación") || mensaje.includes("localización") || mensaje.includes("sensores")) {
            textoEstado.innerText = "Accediendo a los sensores del dispositivo...";
            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaActual = ahora.toLocaleDateString('es-MX', opcionesFecha);
            const horaActual = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((posicion) => {
                    const latitud = posicion.coords.latitude.toFixed(4);
                    const longitud = posicion.coords.longitude.toFixed(4);
                    respuesta = `Entendido Jefe. Conciencia de datos: Hoy es ${fechaActual}, hora exacta: ${horaActual}. Latitud: ${latitud}, Longitud: ${longitud}.`;
                    responderConVoz(respuesta);
                }, () => {
                    respuesta = `Jefe Omar, accedí al reloj interno: son las ${horaActual}, pero los sensores de ubicación están bloqueados.`;
                    responderConVoz(respuesta);
                });
            } else {
                respuesta = `Jefe, el reloj marca las ${horaActual}, pero este dispositivo no cuenta con hardware de geolocalización.`;
                responderConVoz(respuesta);
            }
        }
        
        // 4. PROTOCOLO OBLIGATORIO DE VERACIDAD (Búsqueda Real / Clima sin Alucinaciones)
        else if (mensaje.includes("clima" || mensaje.includes("tiempo actual"))) {
            textoEstado.innerText = "Consultando satélite meteorológico en tiempo real...";
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((posicion) => {
                    const lat = posicion.coords.latitude;
                    const lon = posicion.coords.longitude;
                    
                    // Conexión directa a una API meteorológica pública y gratuita (7timer)
                    // Evita por completo que el sistema invente la temperatura
                    fetch(`https://www.7timer.info/bin/astro.php?lon=${lon}&lat=${lat}&ac=0&unit=metric&output=json`)
                        .then(response => response.json())
                        .then(data => {
                            const temperaturaActual = data.dataseries[0].temp2m;
                            respuesta = `Protocolo de Veracidad activado, Jefe Omar. Los datos del satélite meteorológico para su ubicación actual reportan una temperatura en este momento de ${temperaturaActual}°C. Información verificada en tiempo real.`;
                            responderConVoz(respuesta);
                        })
                        .catch(() => {
                            respuesta = "Jefe, se interrumpió la conexión con el servidor meteorológico externo. No daré datos no verificados para evitar alucinaciones.";
                            responderConVoz(respuesta);
                        });
                }, () => {
                    respuesta = "Jefe, para darle el clima exacto necesito acceso a sus sensores de ubicación. Sin ellos, el protocolo de veracidad bloquea la respuesta.";
                    responderConVoz(respuesta);
                });
            } else {
                respuesta = "Hardware no compatible para geolocalización meteorológica en tiempo real, Jefe.";
                responderConVoz(respuesta);
            }
        }
        
        // 5. PROTOCOLO DE VERACIDAD: Búsquedas Generales en la Web
        else if (mensaje.includes("busca") || mensaje.includes("investiga") || mensaje.includes("internet")) {
            // Extrae lo que quieres buscar quitando la palabra "busca" o "investiga"
            const busqueda = mensaje.replace("busca", "").replace("investiga", "").trim();
            
            respuesta = `Iniciando rastreo en tiempo real para: "${busqueda}". Abriendo motores de búsqueda verificados para usted, Jefe Omar.`;
            responderConVoz(respuesta);
            
            // Abre una pestaña con la búsqueda en tiempo real exacta para que el usuario verifique la información directamente
            window.open(`https://www.google.com/search?q=${encodeURIComponent(busqueda)}`, "_blank");
        }
        
        // 6. EJECUCIÓN DE TAREAS - ENLACES DE INTEGRACIÓN
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
        
        // Respuesta genérica
        else {
            respuesta = "Dígame, Jefe Omar, ¿en qué puedo asistirle? El sistema permanece a la espera de sus instrucciones.";
            responderConVoz(respuesta);
        }

    } else {
        respuesta = "Lo siento, solo respondo si me llamas Viernes, Lu o Il.";
        responderConVoz(respuesta);
    }
}

// Módulo Sintetizador de voz
function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX';
    lectura.rate = 1.0;
    textoEstado.innerText = texto;
    window.speechSynthesis.speak(lectura);
}