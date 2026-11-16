const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const parseDocument = async (file) => {
  const extension = file.originalname.split(".").pop().toLowerCase();

  // PDF parsing
  if (extension === "pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const result = await parser.getText();

      return {
        text: result.text,
        totalPages: result.total,
      };
    } finally {
      await parser.destroy();
    }
  }

  // DOCX parsing
  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return {
      text: result.value,
      totalPages: null,
    };
  }

  // TXT parsing
  if (extension === "txt") {
    return {
      text: file.buffer.toString("utf-8"),
      totalPages: null,
    };
  }

  throw new Error("Unsupported document format.");
};

module.exports = parseDocument;
