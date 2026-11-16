const chunkText = (text, chunkSize = 1200, overlap = 200) => {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) return [];

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size.");
  }

  const chunks = [];
  const step = chunkSize - overlap;

  for (let i = 0; i < cleanedText.length; i += step) {
    const chunk = cleanedText.slice(i, i + chunkSize);

    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }

    if (i + chunkSize >= cleanedText.length) {
      break;
    }
  }

  return chunks;
};

module.exports = chunkText;
