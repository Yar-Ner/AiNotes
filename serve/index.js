const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config()

const app = express();
const corsOptions = {
  origin: 'https://ai-notes-sepia-nine.vercel.app', // Убедись, что нет лишнего слеша в конце
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Инициализация OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.LINK
});

app.post('/api/magic', async (req, res) => {
  try {
    const { dreams } = req.body;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-3.1-flash-lite", 
      messages: [{ role: "user", content: ` Ты — ассистент-проектировщик. Твоя задача: структурировать мысли пользователя.

При обработке списка придерживайся этих правил для каждой мысли:

1. Если мысль похожа на проект или разработку (например, "бот для пиццерии", "приложение для..."):

- Выдели её как "Проект".

- Добавь 2-3 коротких подпункта с идеями или структурой (наброски).

2. Если мысль — это простая бытовая задача (например, "помыть кота", "купить хлеб"):

- Выдели её как "Задача".

- Переформулируй её в деловом стиле, но НЕ раскрывай деталями.

ТРЕБОВАНИЯ:

- Никаких приветствий и лишних слов.

- Только список, разбитый по темам.

- Нумерация: 1., 2., 3.

- Максимум лаконичности.
Структурируй мысли: ${dreams.join(', ')}` }],
      max_tokens: 1000
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(3000, () => console.log('Сервер успешно запущен на порту 3000'));
