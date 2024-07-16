import { env } from "@/env";
import { createOpenAI } from "@ai-sdk/openai";

export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
  // apiKey: env.TOGETHER_API_KEY,
  // baseURL: "https://api.together.xyz/v1",
});

export const openaiModel = openai("gpt-4o");
// export const openaiModel = openai("mistralai/Mixtral-8x7B-Instruct-v0.1");
export const openAIEmbeddingsModel = openai.embedding("text-embedding-ada-002");
