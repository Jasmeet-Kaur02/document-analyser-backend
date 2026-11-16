const Document = require("../models/DocumentModel");
const DocumentChunk = require("../models/DocumentChunkModel");

const { answerQuestion } = require("../services/AIService");

// Basic keyword matching
const findRelevantChunks = (question, chunks, limit = 5) => {
  const stopWords = new Set([
    "the",
    "is",
    "are",
    "was",
    "were",
    "a",
    "an",
    "and",
    "or",
    "but",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "what",
    "when",
    "where",
    "who",
    "why",
    "how",
    "can",
    "could",
    "would",
    "should",
    "do",
    "does",
    "did",
    "about",
    "this",
    "that",
    "it",
    "i",
    "you",
    "me",
    "my",
  ]);

  const keywords = question.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];

  const filteredKeywords = keywords.filter(
    (word) => !stopWords.has(word) && word.length > 1,
  );

  if (!filteredKeywords.length) {
    return chunks.slice(0, limit);
  }

  const scoredChunks = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();

    const score = filteredKeywords.reduce((total, keyword) => {
      const matches = content.match(
        new RegExp(
          `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "g",
        ),
      );

      return total + (matches ? matches.length : 0);
    }, 0);

    return {
      ...chunk.toObject(),
      score,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Ask question about uploaded document
const askQuestion = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document ID and question are required.",
      });
    }

    // Check document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    if (document.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Document processing is not completed.",
      });
    }

    // Get document chunks
    const chunks = await DocumentChunk.find({
      documentId,
    }).sort({ chunkIndex: 1 });

    if (!chunks.length) {
      return res.status(404).json({
        success: false,
        message: "No document content found.",
      });
    }

    // Find relevant chunks using keyword matching
    const relevantChunks = findRelevantChunks(message, chunks);

    if (!relevantChunks.length) {
      return res.status(200).json({
        success: true,
        answer:
          "I couldn't find relevant information in the uploaded document to answer this question.",
        sources: [],
      });
    }

    // Prepare context for Gemini
    const context = relevantChunks
      .map(
        (chunk, index) =>
          `SOURCE ${index + 1} (Chunk ${chunk.chunkIndex}):\n${chunk.content}`,
      )
      .join("\n\n");

    // Generate answer using Gemini
    const answer = await answerQuestion({
      question: message,
      context,
    });

    return res.status(200).json({
      success: true,
      answer,
      sources: relevantChunks.map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion,
};
