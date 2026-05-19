// MODULADOR DE ONDAS EN TIEMPO REAL (PUNTO 14)
function activarAnalisisBiometrico() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    
    const barrasUI = document.querySelectorAll('.barra-onda');
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fuente = audioContext.createMediaStreamSource(stream);
        analizador = audioContext.createAnalyser();
        analizador.fftSize = 64; // Tamaño de buffer optimizado para las 10 barras de la UI
        fuente.connect(analizador);
        
        const bufferLength = analizador.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let sumaFrecuencias = 0;
        let conteouestras = 0;
        
        // Bucle de renderizado para mover las ondas de la pantalla
        const refrescarOndas = () => {
            if (!analizador) return;
            requestAnimationFrame(refrescarOndas);
            
            analizador.getByteFrequencyData(dataArray);
            
            // Mapear los datos de audio directamente a las 10 barras cian de la UI
            barrasUI.forEach((barra, indice) => {
                const valorAudio = dataArray[indice] || 0;
                // Convertir la frecuencia física en escalado de pixeles (Altura)
                const nuevaAltura = Math.max(10, Math.min(65, valorAudio * 0.4));
                barra.style.height = `${nuevaAltura}px`;
                barra.style.transform = 'scaleY(1)'; // Forzar actualización de hardware gráfico
            });
        };
        
        // Iniciar animación activa
        refrescarOndas();
        
        const intervalo = setInterval(() => {
            if (!analizador) { clearInterval(intervalo); return; }
            analizador.getByteFrequencyData(dataArray);
            for (let i = 0; i < bufferLength; i++) {
                if (dataArray[i] > 0) { sumaFrecuencias += dataArray[i]; conteouestras++; }
            }
        }, 300);

        // Apagado físico del canal y regreso a animación pasiva de espera
        setTimeout(() => {
            clearInterval(intervalo);
            if (conteouestras > 0) { frecuenciaMediaDetectada = Math.round(sumaFrecuencias / conteouestras); }
            stream.getTracks().forEach(track => track.stop());
            if (audioContext) audioContext.close();
            analizador = null;
            
            // Restaurar las ondas a su animación CSS pasiva del archivo style.css
            barrasUI.forEach((barra) => {
                barra.style.height = ''; 
            });
        }, 4000); // 4 segundos de escucha activa por comando
    }).catch(() => {
        textoEstado.innerText = "Error de hardware: Micrófono bloqueado.";
    });
}