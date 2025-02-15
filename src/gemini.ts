import dotenv from "dotenv";
dotenv.config();

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(apiKey);

export const gemini = (system: string, userLanguage: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: system,
  });

  const languageInstruction =
    userLanguage === "english"
      ? "Please respond in english"
      : "सभी उत्तर हिंदी में दें। कृपया हिंदी में ही उत्तर दें।";

  return {
    model,
    languageInstruction,
  };
};
