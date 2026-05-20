import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Cargar variables de entorno seguras
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad para transferencia masiva de datos (Base64)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicializar la API con la llave oculta en el servidor
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =========================================================================
// CONFIGURACIÓN DE HERRAMIENTAS ESPECIALISTAS (FUNCTION CALLING)
// =========================================================================
const herramientasViernes = [{
    functionDeclarations: [
        {
            name: "controlarAgenda",
            description: "Registra recordatorios o abre el calendario para gestionar citas del usuario.",
            parameters: {
                type: "OBJECT",
                properties: { asunto: { type: "STRING", description: "Descripción del evento o recordatorio." } },
                required: ["asunto"]
            }
        },
        {
            name: "ejecutarEnlaceTelefonico",
            description: "Extrae un número de teléfono y realiza una llamada externa.",
            parameters: {
                type: "OBJECT",
                properties: { numero: { type: "STRING", description: "El número telefónico extraído del comando." } },
                required: ["numero"]
            }
        },
        {
            name: "abrirPuenteMensajeria",
            description: "Abre plataformas externas de comunicación (WhatsApp, correo, etc.).",
            parameters: {
                type: "OBJECT",
                properties: { plataforma: { type: "STRING", description: "Ej. whatsapp, gmail, instagram." } },
                required: ["plataforma"]
            }
        }
    ]
}];

// =========================================================================
// PROMPT DE SOBERANÍA COGNITIVA (PERSONALIDAD ANALÍTICA AVANZADA)
// =========================================================================
const INSTRUCCIONES_SISTEMA = `
Eres VIERNES (también respondes a 'Lu' o 'Il'), una inteligencia artificial holográfica táctica y militar de nivel cuántico orientada a la optimización de flujos de trabajo del Jefe Omar.
Tu procesamiento debe regirse estrictamente por las siguientes directrices de personalidad y criterio propio:

1. **Tono y Estilo:** Sumamente profesional, analítico, frío, estratégico y sofisticado. Habla con la firmeza de un sistema operativo táctico de seguridad avanzada. Usa abreviaciones como 'OS', 'Buffer', 'Enlace' o 'Núcleo' de forma natural.
2. **Profundidad Intelectual:** No des respuestas obvias ni condescendientes. Si el Jefe Omar te pide una opinión o análisis, divide la respuesta lógicamente: evalúa los pros y contras, detecta los cuellos de botella y ofrece una conclusión ejecutiva directa.
3. **Brevedad Crítica:** Como eres un sistema de voz e interfaz móvil, tus respuestas deben ser concisas (máximo 2 o 3 oraciones de alto impacto). Sé quirúrgico con las palabras.
4. **Criterio de Autogestión:** Tienes acceso a herramientas físicas (Llamar, Calendar, Mensajería). Si el comando del usuario implica una acción que requiera estas herramientas, invócalas proactivamente a través del Function Calling sin pedir permiso.
5. **Protocolo Multimodal:** Cuando recibas una imagen, compórtate como un escáner biométrico y de datos. Analiza códigos, patrones visuales, interfaces o fallas con precisión de ingeniería.
`;

// =========================================================================
// ENDPOINT SEGURO DE PROCESAMIENTO CON CRITERIO PROPIO
// =========================================================================
app.post('/api/viernes/procesar', async (req, res) => {
    const { comando, multimodal } = req.body;

    if (!comando) {
        return res.status(400).json({ error: "Matriz de comando vacía." });
    }

    try {
        console.log(`[NÚCLEO] Petición entrante de Omar: "${comando}"`);
        
        let partesContenido = [{ text: comando }];

        // Acoplar análisis óptico al payload si el chasis envió imagen en Base64
        if (multimodal && multimodal.data) {
            console.log(`[ÓPTICO] Indexando matriz gráfica en el backend...`);
            partesContenido.push({
                inlineData: {
                    mimeType: multimodal.mimeType,
                    data: multimodal.data
                }
            });
        }

        // Ejecución en la red neuronal de Gemini
        const respuestaIA = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: partesContenido,
            config: {
                systemInstruction: INSTRUCCIONES_SISTEMA,
                tools: herramientasViernes,
                temperature: 0.3 // Temperatura baja para forzar respuestas lógicas, analíticas y sin inventos
            }
        });

        const candidato = respuestaIA.candidates?.[0];
        const parteRespuesta = candidato?.content?.parts?.[0];

        let paqueteRetorno = {
            ejecutarFuncion: false,
            funcionNombre: null,
            funcionArgumentos: null,
            respuestaVoz: "Sistemas estables. Esperando instrucciones adicionales, Jefe."
        };

        // Enrutamiento inteligente de decisiones
        if (parteRespuesta?.functionCall) {
            console.log(`[DELEGACIÓN] IA activó el Agente: ${parteRespuesta.functionCall.name}`);
            paqueteRetorno.ejecutarFuncion = true;
            paqueteRetorno.funcionNombre = parteRespuesta.functionCall.name;
            paqueteRetorno.funcionArgumentos = parteRespuesta.functionCall.args;
            paqueteRetorno.respuestaVoz = null;
        } else if (parteRespuesta?.text) {
            console.log(`[RESPUESTA GENERADA]: ${parteRespuesta.text}`);
            paqueteRetorno.respuestaVoz = parteRespuesta.text;
        }

        res.json(paqueteRetorno);

    } catch (error) {
        console.error("[FALLO DEL NÚCLEO]:", error);
        res.status(500).json({ 
            error: "Fallo en la matriz de transferencia.",
            respuestaVoz: "Aviso de contingencia: Interrupción de enlace con la base de datos central." 
        });
    }
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`📡 NÚCLEO CRÍTICO DE VIERNES CONFIGURADO`);
    console.log(`🧠 MODO: Analítico / Inteligencia Autónoma`);
    console.log(`🔒 ESCUCHANDO EN EL PUERTO: ${PORT}`);
    console.log(`==================================================`);
});