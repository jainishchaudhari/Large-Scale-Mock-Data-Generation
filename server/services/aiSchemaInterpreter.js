import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

console.log(
  "Gemini API Key loaded:",
  !!process.env.GEMINI_API_KEY
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const interpretSchema = async (schema) => {
  try {
    const prompt = `
You are a schema field interpreter for a mock data generation system.

Analyze the following JSON schema and identify the semantic meaning
of each field.

Allowed types:
name
email
age
city
country
phone
address
company
date
number
boolean
text

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.

Input schema:
${JSON.stringify(schema)}
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
    });

    const text = interaction.output_text.trim();

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "AI Schema Interpretation Error:",
      error
    );

    throw error;
  }
};