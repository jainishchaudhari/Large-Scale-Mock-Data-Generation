import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const interpretSchema = async (schema) => {
  try {
    const prompt = `
You are a semantic field interpreter for a mock data generation system.

Analyze the JSON schema and identify the semantic meaning of fields.

IMPORTANT:
- Do NOT modify the original schema.
- Do NOT remove constraints.
- Do NOT generate values.
- Do NOT return JSON Schema.
- Return only a flat semantic mapping for fields.
- For nested fields, use dot notation.

Allowed semantic types:
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

Example input:
{
  "age": {
    "type": "integer",
    "minimum": 5,
    "maximum": 18
  },
  "gender": {
    "type": "string",
    "enum": ["Male", "Female", "Other"]
  }
}

Return:
{
  "age": "age",
  "gender": "text"
}

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