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

// PROTOCOLO PRINCIPAL: PROCESADOR DE ÓRDENES Y MEMORIA
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
        
        // 3. PROTOCOLO OBLIGATORIO: MEMORIA DE LARGO PLAZO (Guardar datos en el Historial)
        else if (mensaje.includes("anota") || mensaje.includes("recuerda") || mensaje.includes("guarda en el historial")) {
            // Extrae el dato útil eliminando las palabras de comando
            let datoAGuardar = mensaje.replace("viernes", "").replace("lu", "").replace("il", "")
                                      .replace("anota", "").replace("recuerda", "").replace("guarda en el historial", "").trim();
            
            if (datoAGuardar.length > 0) {
                // Obtener el historial viejo existente o crear uno nuevo vacío si no hay nada
                let historialCompleto = localStorage.getItem('historial_viernes') || "";
                
                const fechaMarca = new Date().toLocaleDateString('es-MX');
                // Añadir el nuevo dato con un salto de línea y fecha de registro
                historialCompleto += `[${fechaMarca}]: ${datoAGuardar}. `;
                
                // Guardar permanentemente en el disco del navegador
                localStorage.setItem('historial_viernes', historialCompleto);
                
                respuesta = `Entendido Jefe Omar. He archivado el dato en mi memoria de largo plazo. El sistema continúa en evolución.`;
            } else {
                respuesta = "Jefe, no detecté qué dato específico desea que archive en el historial.";
            }
            responderConVoz(respuesta);
        }

        // PROTOCOLO OBLIGATORIO: MEMORIA DE LARGO PLAZO (Leer el Historial guardado)
        else if (mensaje.includes("historial") || mensaje.includes("qué recuerdas") || mensaje.includes("lee la memoria")) {
            let memoriaConsultada = localStorage.getItem('historial_viernes');
            
            if (memoriaConsultada && memoriaConsultada.trim().length > 0) {
                respuesta = `Accediendo a nuestra base de datos histórica, Jefe Omar. Esto es lo que tengo registrado en mi memoria de largo plazo: ${memoriaConsultada}`;
            } else {
                respuesta = "Jefe, mi registro histórico local está vacío en este momento. No tengo datos archivados aún.";
            }
            responderConVoz(respuesta);
        }

        // PROTOCOLO OBLIGATORIO: MEMORIA DE LARGO PLAZO (Borrar historial si lo requieres)
        else if (mensaje.includes("borra el historial") || mensaje.includes("reinicia tu memoria")) {
            localStorage.removeItem('historial_viernes');
            respuesta = "Entendido, Jefe Omar. Historial de largo plazo eliminado. Registros formateados a cero.";
            responderConVoz(respuesta);
        }
        
        // 4. PROTOCOLO OBLIGATORIO DE VERACIDAD (Clima sin Alucinaciones)
        else if (mensaje.includes("clima") || mensaje.includes("tiempo actual")) {
            textoEstado.innerText = "Consultando satélite meteorológico en tiempo real...";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((posicion) => {
                    const lat = posicion.coords.latitude;
                    const lon = posicion.coords.longitude;
                    fetch(`https://www.7timer.info/bin/astro.php?lon=${lon}&lat=${lat}&ac=0&unit=metric&output=json`)
                        .then(response => response.json())
                        .then(data => {
                            const temperaturaActual = data.dataseries[0].temp2m;
                            respuesta = `Protocolo de Veracidad: Satélite reporta una temperatura de ${temperaturaActual}°C en su ubicación actual, Jefe Omar.`;
                            responderConVoz(respuesta);
                        })
                        .catch(() => {
                            respuesta = "Jefe, error de enlace con el servidor meteorológico. Respuesta bloqueada para evitar alucinaciones.";
                            responderConVoz(respuesta);
                        });
                }, () => {
                    respuesta = "Jefe, necesito permisos de ubicación para activar el protocolo de veracidad meteorológica.";
                    responderConVoz(respuesta);
                });
            } else {
                respuesta = "Hardware de geolocalización no compatible, Jefe.";
                responderConVoz(respuesta);
            }
        }
        
        // 5. PROTOCOLO DE VERACIDAD: Búsquedas Web
        else if (mensaje.includes("busca") || mensaje.includes("investiga")) {
            const busqueda = mensaje.replace("busca", "").replace("investiga", "").trim();
            respuesta = `Buscando en la red en tiempo real: "${busqueda}". Abriendo registros verificados, Jefe Omar.`;
            responderConVoz(respuesta);
            window.open(`https://www.google.com/search?q=${encodeURIComponent(busqueda)}`, "_blank");
        }
        
        // 6. EJECUCIÓN DE TAREAS - ENLACES
        else if (mensaje.includes("whatsapp") || mensaje.includes("mensaje")) {