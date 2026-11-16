const ai = require("../config/gemini");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Generate document summary
const generateSummary = async (documentText) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `
      You are an expert document analyst.

      Read the following document and generate a clear,
      well-structured summary.

      Include:
      - Main topic
      - Important points
      - Key findings
      - Important conclusions

      Keep the summary concise and easy to understand.

      DOCUMENT:
      ${documentText}
    `,
  });

  return response.text;
};

// Answer questions using document context
const answerQuestion = async ({ question, context }) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `
      You are an intelligent document analysis assistant.

      Answer the user's question using ONLY the provided
      document context.

      Rules:
      - Do not invent information.
      - Do not use outside knowledge.
      - If the answer is not available in the document,
        clearly say that the document does not contain
        enough information to answer.
      - Give a clear and helpful answer.

      DOCUMENT CONTEXT:
      ${context}

      USER QUESTION:
      ${question}
    `,
  });

  return response.text;
};

module.exports = {
  generateSummary,
  answerQuestion,
};
