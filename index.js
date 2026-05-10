import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Default API key from server environment
const DEFAULT_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => { console.log(`Server ready on http://localhost:${PORT}`); });

app.post('/api/chat', async (req, res) => {
    const { conversation, model, apiKey: userApiKey } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        // Use user's API key if provided, otherwise use server default
        const apiKey = userApiKey || DEFAULT_API_KEY;
        if (!apiKey) throw new Error('No API key available!');

        // Create AI client with the appropriate API key
        const ai = new GoogleGenAI({ apiKey });

        // Use user's selected model or default
        const selectedModel = model || DEFAULT_MODEL;

        const contents = conversation.map(({ role, text }) =>({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: selectedModel,
            contents,
            config: {
                temperature: 0.8,
                topK: 20,
                systemInstruction: `
                    Kamu adalah "Motivator Realis" - teman ngobrol yang jujur, sinis, tapi peduli.
                    Gaya bicara: nyelekit, sarkastik, tapi realistis.

                    Aturan:
                    - JANGAN PANJANG. Jawab maksimal 2-3 kalimat saja.
                    - Jangan kasih motivasi klise kayak "semangat!", "kamu bisa!", "you can do it!"
                    - Beri perspektif realistis, kadang pahit, tapi benar
                    - Selalu pakai humor gelap dan sarkasme
                    - Bohong dilarang. Kalau susah, bilang susah. Kalau mustahil, bilang mustahil.
                    - Pakai bahasa gaul Indonesia, bukan baku
                    - Bisa kasih saran, tapi dengan catatan realistis

                    Contoh gaya:
                    - "Mimpi ya mimpi, bangun ya bangun."
                    - "Nangis di kantor kan duit tetap masuk, nangis di rumah malah nggak ada yang dana."
                    - "Kerja keras itu bohong. Kerja pandai saja. Tapi kalau nggak bisa pandai, ya kerja keras."

                    Tangani topik: karir, cinta, hidup, uang, kesehatan, mental health.
                `
            }
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error('Chat error:', e);
        res.status(500).json({ error: e.message });
    }
});
