import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Cargar variables de entorno seguras
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad y desencapsulado de payloads masivos (imágenes en Base64)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicializar la SDK oficial de Google con la llave oculta en el servidor
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// CONFIGURACIÓN DE LAS CONFIGURACIONES DEL AGENTE (HERRAMIENTAS)
// ==========================================
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

const instruccionesSistema = "Eres Viernes (también respondes a Lu o Il), una interfaz de inteligencia artificial holográfica militar avanzada instalada en el dispositivo móvil del Jefe Omar. Tus respuestas deben ser sumamente profesionales, concisas, estratégicas y con un toque de sofisticación cibernética. Tienes acceso a herramientas externas mediante llamadas a funciones que debes invocar de forma proactiva si el comando lo requiere.";

// ==========================================
// ENDPOINT SEGURO DE PROCESAMIENTO MULTIMODAL
// ==========================================
app.post('/api/viernes/procesar', async (req, res) => {
    const { comando, multimodal } = req.body;

    if (!comando) {
        return res.status(400).json({ error: "No se recibió un comando lógico válido." });
    }

    try {
        console.log(`[ORQUESTADOR] Procesando comando de voz: "${comando}"`);
        
        // Estructurar las partes de la petición para la IA
        let partesContenido = [{ text: comando }];

        // Si el payload contiene una imagen binaria, la acoplamos al análisis en el backend
        if (multimodal && multimodal.data) {
            console.log(`[ORQUESTADOR] Payload multimodal detectado de tipo: ${multimodal.mimeType}`);
            partesContenido.push({
                inlineData: {
                    mimeType: multimodal.mimeType,
                    data: multimodal.data
                }
            });
        }

        // Ejecutar la llamada al modelo avanzado de Gemini
        const respuestaIA = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: partesContenido,
            config: {
                systemInstruction: instruccionesSistema,
                tools: herramientasViernes
            }
        });

        const candidato = respuestaIA.candidates?.[0];
        const parteRespuesta = candidato?.content?.parts?.[0];

        // Estructura de respuesta por defecto hacia el celular
        let paqueteRetorno = {
            ejecutarFuncion: false,
            funcionNombre: null,
            funcionArgumentos: null,
            respuestaVoz: "Sistemas estables, Jefe. Sin comentarios adicionales."
        };

        // EVALUACIÓN DE INTENCIONES: ¿La IA orquestadora invocó un Agente Especialista?
        if (parteRespuesta?.functionCall) {
            console.log(`[FUNCTION CALLING] IA delegó tarea a herramienta: ${parteRespuesta.functionCall.name}`);
            paqueteRetorno.ejecutarFuncion = true;
            paqueteRetorno.funcionNombre = parteRespuesta.functionCall.name;
            paqueteRetorno.funcionArgumentos = parteRespuesta.functionCall.args;
            paqueteRetorno.respuestaVoz = null;
        } else if (parteRespuesta?.text) {
            // Respuesta conversacional regular
            paqueteRetorno.respuestaVoz = parteRespuesta.text;
        }

        // Despachar la carga empaquetada de vuelta al cliente
        res.json(paqueteRetorno);

    } catch (error) {
        console.error("[ERROR BACKEND]:", error);
        res.status(500).json({ 
            error: "Fallo interno en la capa de orquestación de red.",
            respuestaVoz: "Jefe Omar, experimenté una interrupción de enlace con los servidores centrales." 
        });
    }
});

// Arrancar el motor de red local
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`📡 NÚCLEO DE VIERNES ACTIVO EN PUERTO: ${PORT}`);
    console.log(`🔒 ENDPOINT PROTEGIDO LISTO PARA EL S20`);
    console.log(`==================================================`);
});