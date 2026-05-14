# Motivator Realis 🎭

Chatbot AI dengan kepribadian sinis, realistis, dan nyelekit. Dibuat untuk memberikan "motivasi" jujur tanpa basa-basi.

**Live Demo:** [https://gemini-chatbot-api-livid.vercel.app](https://gemini-chatbot-api-livid.vercel.app) 🚀

## Screenshot
<img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/10b4ee7c-c94b-4409-99b3-ed0fdeea5d6a" />

## Fitur

- 💀 **Sarkastis & Nyelekit** - Jawaban pedas tapi jujur
- 🎯 **Realistis** - Ngerti kalau hidup emang susah
- 💬 **Bahasa Gaul** - Ngobrol santai kayak teman
- 🌙 **Dark Mode** - Tampilan aesthetic yang nyaman di mata
- ⚡ **Real-time** - Respon cepat pakai Google Gemini API
- ⚙️ **Model Selector** - Pilih model AI (flash, flash-lite, gemini-3, dll)
- 🔑 **Custom API Key** - Pakai API key sendiri (opsional)
- 📝 **Example Prompts** - Klik untuk langsung chat dengan respon lucu

## Prasyarat

- Node.js 18+ terinstall
- API Key dari Google Gemini (dapatkan di [ai.google.dev](https://ai.google.dev))

## Instalasi

1. Clone atau download project ini

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` di root folder dan tambahkan API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Jalankan server:
```bash
npm start
```

5. Buka browser di `http://localhost:3000`

## Cara Pakai

1. Ketik curhatan atau pertanyaan di input box
2. Klik tombol kirim (atau tekan Enter)
3. Terima kenyataan 🫡

## Contoh Pertanyaan

| Pertanyaan | Jawaban (kira-kira) |
|------------|---------------------|
| "Gimana cara jadi kaya?" | "Dua cara: lahir dari orang kaya, atau nikah orang kaya." |
| "Aku capek kerja." | "Resign aja. Oh tunggu, butuh duit ya? Ya sabar." |
| "Masa depanku suram." | "Emang. Tapi sekarang juga nggak terang-terang banget kok." |
| "Cara move on dari mantan?" | "Ganti baru. Atau kalau nggak bisa, nanti juga ilang. Waktu tuh obat pahit tapi manjur." |

## Struktur Project

```
gemini-chatbot-api/
├── index.js           # Backend server & API endpoint
├── package.json       # Dependencies
├── .env              # API key (buat sendiri)
└── public/
    ├── index.html    # Frontend UI
    ├── style.css     # Styling dark theme
    └── script.js     # Chat logic & markdown parser
```

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Frontend**: Vanilla JavaScript (tanpa framework)

## Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `GEMINI_API_KEY` | API key dari Google AI Studio |

## API Endpoint

### POST /api/chat

Request body:
```json
{
  "conversation": [
    { "role": "user", "text": "Aku capek kerja." },
    { "role": "model", "text": "Resign aja..." }
  ]
}
```

Response:
```json
{
  "result": "Jawaban motivator realis..."
}
```

## Troubleshooting

**Error: "Failed to get response from server"**
- Cek API key di `.env` sudah benar
- Pastikan punya koneksi internet

**Bot jawabannya kepanjangan**
- Edit file `index.js`, line 45: atur batas kalimat

## License

MIT - Silakan dipakai untuk belajar atau dikembangin lagi.

---

*Dibuat dengan pahitnya realita dan Google Gemini.*
