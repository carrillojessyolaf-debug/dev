// ==========================================
// MOTOR DE RENDERIZADO DE CIRCUITOS CIAN (PUNTO 13)
// ==========================================
const canvas = document.getElementById('canvas-circuitos');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    function ajustarCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dibujarCircuitos();
    }

    function dibujarCircuitos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.06)'; // Tono cian translúcido de circuito
        ctx.lineWidth = 1.5;

        // Trazado de líneas horizontales y verticales fijas estilo red troncal
        const espaciado = 60;
        
        for (let x = 0; x < canvas.width; x += espaciado) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            // Simular desvío a 45 grados en nodos de circuitos
            if (x % 120 === 0) {
                ctx.lineTo(x, canvas.height * 0.4);
                ctx.lineTo(x + 30, (canvas.height * 0.4) + 30);
                ctx.lineTo(x + 30, canvas.height);
            } else {
                ctx.lineTo(x, canvas.height);
            }
            ctx.stroke();
        }

        // Agregar pequeños nodos/círculos brillantes en intersecciones aleatorias
        ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
        for (let i = 0; i < 15; i++) {
            let nodoX = Math.round((Math.random() * canvas.width) / espaciado) * espaciado;
            let nodoY = Math.round((Math.random() * canvas.height) / espaciado) * espaciado;
            ctx.beginPath();
            ctx.arc(nodoX, nodoY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    window.addEventListener('resize', ajustarCanvas);
    ajustarCanvas();
}
// ==========================================
// AQUÍ CONTINÚA TU CÓDIGO PREVIO DE APP.JS...
// ==========================================