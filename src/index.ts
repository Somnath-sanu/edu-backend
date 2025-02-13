import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";
import { generatePromts } from "./explore-content";
import { gemini } from "./gemini";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
//   dangerouslyAllowBrowser: true,
// });

app.post("/api/generate", async (req, res) => {
  const { systemPrompt, userPrompt, maxTokens = 5000 } = req.body;

  try {
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: systemPrompt,
    //     },
    //     {
    //       role: "user",
    //       content: userPrompt,
    //     },
    //   ],
    //   max_tokens: maxTokens,
    // });

    const sanitizedUserPrompt = userPrompt.replace(/[\r\n]+/g, " ").trim();
    const sanitizedSystemPrompt = systemPrompt.replace(/[\r\n]+/g, " ").trim();

    const model = gemini(sanitizedSystemPrompt);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: sanitizedUserPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    res.json({ content: result.response });
  } catch (error) {
    // console.error("OpenAI API Error:", error);
    // res.status(500).json({ error: "Failed to generate content" });
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/api/explore", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    res.json({
      message: "No query provided!!",
    });
    return;
  }

  try {
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a social media trend expert who explains topics by connecting them to current viral trends, memes, and pop culture moments.",
    //     },
    //     {
    //       role: "user",
    //       content: `${query}`,
    //     },
    //   ],
    //   temperature: 0.9,
    //   max_tokens: 4000,
    // });
    const systemPrompt =
      "You are a social media trend expert who explains topics by connecting them to current viral trends, memes, and pop culture moments.";

    const model = gemini(systemPrompt);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [query],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.9,
      },
    });

    res.json({ content: result.response });
  } catch (error) {
    console.error("Gemini Error in explore:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/api/explore-content", async (req, res) => {
  const { query, age } = req.body;

  if (!query || !age) {
    res.json({
      message: "Invalid input!",
    });
    return;
  }

  try {
    const { systemPrompt, userPrompt } = generatePromts({ query, age });
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: userPrompt },
    //   ],
    //   temperature: 0.7,
    //   stream: true,
    // });
    const model = gemini(systemPrompt);
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
    });

    // for await (const part of response) {
    //   const content = part.choices[0]?.delta?.content;
    //   if (content) {
    //     res.write(`data: ${JSON.stringify({ content })}\n\n`);
    //   }
    // }

    res.json({ content: result.response });
  } catch (error) {
    console.error("Error in explore-content:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
