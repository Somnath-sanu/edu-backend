import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generatePromts } from "./explore-content";
import { gemini } from "./gemini";
import { Request, Response } from "express";
import { dailyLimiter, hourlyLimiter, minuteLimiter } from "./limiter";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(minuteLimiter);
app.use(hourlyLimiter);
app.use(dailyLimiter);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

app.post("/api/generate", async (req: Request, res: Response) => {
  const {
    systemPrompt,
    userPrompt,
    maxTokens = 5000,
    userLanguage = "english",
  } = req.body;

  try {
    const sanitizedUserPrompt = userPrompt.replace(/[\r\n]+/g, " ").trim();
    const sanitizedSystemPrompt = systemPrompt.replace(/[\r\n]+/g, " ").trim();

    const { model, languageInstruction } = gemini(
      sanitizedSystemPrompt,
      userLanguage
    );

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${languageInstruction} ${sanitizedUserPrompt}`,
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
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/api/explore", async (req: Request, res: Response) => {
  const { query, userLanguage = "english" } = req.body;
  if (!query) {
    res.json({
      message: "No query provided!!",
    });
    return;
  }

  try {
    const systemPrompt =
      "You are a social media trend expert who explains topics by connecting them to current viral trends, memes, and pop culture moments.";

    const { model, languageInstruction } = gemini(systemPrompt, userLanguage);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${languageInstruction} ${query}`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.7,
      },
    });

    res.json({ content: result.response });
  } catch (error) {
    console.error("Gemini Error in explore:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/api/explore-content", async (req: Request, res: Response) => {
  const { query, age, userLanguage = "english" } = req.body;

  if (!query || !age) {
    res.json({
      message: "Invalid input!",
    });
    return;
  }

  try {
    const { systemPrompt, userPrompt } = generatePromts({
      query,
      age,
    });

    const { model, languageInstruction } = gemini(systemPrompt, userLanguage);
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${languageInstruction} ${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.7,
      },
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
