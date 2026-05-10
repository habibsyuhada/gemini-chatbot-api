import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => { console.log(`Server ready on http://localhost:${PORT}`); });

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) =>({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
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
        })
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});