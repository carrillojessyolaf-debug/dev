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
// 2. ENLACE SEGURO AL PROCESAMIENTO EN LA NUBE (BACKEND)
// ==========================================
// Aquí defines la URL de tu servidor intermedio para no exponer llaves privadas en el S20
const BACKEND_ORQUESTADOR_URL = "http://localhost:3000/api/viernes/procesar"; 

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
                payloadMultimodal.datosBase64 = base64Completo.split(',')[1]; // Extrae solo la cadena binaria pura