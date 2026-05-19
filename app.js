// Elementos de la pantalla que vamos a controlar
const botonActivar = document.getElementById('boton-activar');
const textoEstado = document.getElementById('texto-estado');

// Configuración del sistema de reconocimiento de voz de tu celular o computadora
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    textoEstado.innerText = "Tu navegador no soporta comandos de voz.";
} else {
    const reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-MX'; // Idioma Español de México
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    // Al hacer clic o tocar el núcleo de Viernes
    botonActivar.click = () => { iniciarViernes(); };
    botonActivar.addEventListener('click', () => {
        iniciarViernes();
    });

    function iniciarViernes() {
        textoEstado.innerText = "Escuchando...";
        botonActivar.style.borderColor = "#ff0055"; // Cambia de color al escuchar
        botonActivar.style.boxShadow = "0 0 20px #ff0055";
        reconocimiento.start();
    }

    // Cuando el sistema termina de escuchar lo que dijiste
    reconocimiento.onresult = (event) => {
        const loQueDije = event.results[0][0].transcript.toLowerCase();
        textoEstado.innerText = `Dijiste: "${loQueDije}"`;
        botonActivar.style.borderColor = "#00ffcc"; // Regresa al color original
        botonActivar.style.boxShadow = "0 0 20px #00ffcc";
        
        procesarOrden(loQueDije);
    };

    // Si hay un error o dejas de hablar
    reconocimiento.onerror = () => {
        textoEstado.innerText = "No te escuché bien. Presiona de nuevo.";
        botonActivar.style.borderColor = "#00ffcc";
    };
}

// PROTOCOLO DE IDENTIDAD Y RESPUESTA (Aquí se configuran tus órdenes)
function procesarOrden(mensaje) {
    let respuesta = "";

    // Evalúa si lo llamaste Viernes, Lu o Il
    if (mensaje.includes("viernes") || mensaje.includes("lu") || mensaje.includes("il")) {
        
        // Protocolo Obligatorio de Activación
        if (mensaje.includes("hola") || mensaje.includes("actívate") || mensaje.includes("despierta")) {
            // Elige una frase de forma aleatoria de tus opciones obligatorias
            const frases = [
                "Lu Li lista para trabajar con usted, ¿qué haremos hoy?",
                "Jefe, estoy lista para el show... ¿Qué procede?"
            ];
            respuesta = frases[Math.floor(Math.random() * frases.length)];
        } 
        // Protocolo Obligatorio de Saludo con Hora y Fecha
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
        }
        // Si no entiende la orden pero dijiste su nombre
        else {
            respuesta = "Entendido Jefe, detecto mi nombre pero aún no tengo programada esa función específica. Vamos paso a paso.";
        }

    } else {
        // Si hablaste pero no dijiste su nombre de activación
        respuesta = "Lo siento, solo respondo si me llamas Viernes, Lu o Il.";
    }

    responderConVoz(respuesta);
}

// Función para que Viernes te hable de regreso (Sintetizador de voz)
function responderConVoz(texto) {
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-MX';
    lectura.rate = 1.0; // Velocidad de la voz
    
    // Cambiar texto en pantalla para que leas lo que dice
    textoEstado.innerText = texto;
    window.speechSynthesis.speak(lectura);
}