const Document = require("../models/DocumentModel");
const DocumentChunk = require("../models/DocumentChunkModel");

const parseDocument = require("../services/DocumentParser");
const chunkText = require("../services/ChunkText");
const { generateSummary } = require("../services/AIService");

// Upload and process document
const uploadDocument = async (req, res, next) => {
  let document;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document.",
      });
    }

    const file = req.file;

    // Create document record
    document = await Document.create({
      title: file.originalname,
      originalName: file.originalname,
      fileType: file.originalname.split(".").pop().toLowerCase(),
      fileSize: file.size,
      status: "processing",
    });

    // Extract document text
    const parsedData = await parseDocument(file);

    if (!parsedData.text || !parsedData.text.trim()) {
      throw new Error("No readable text found in the document.");
    }

    // Divide extracted text into chunks
    const chunks = chunkText(parsedData.text);

    if (!chunks.length) {
      throw new Error("Unable to create document chunks.");
    }

    // Generate document summary
    const summary = await generateSummary(parsedData.text);

    // Save chunks in MongoDB
    await DocumentChunk.insertMany(
      chunks.map((content, index) => ({
        documentId: document._id,
        content,
        chunkIndex: index,
      })),
    );

    // Update document record
    document.summary = summary;
    document.totalPages = parsedData.totalPages;
    document.totalChunks = chunks.length;
    document.status = "completed";

    await document.save();

    return res.status(201).json({
      success: true,
      message: "Document uploaded and analyzed successfully.",
      document,
    });
  } catch (error) {
    // Clean up incomplete processing
    if (document) {
      await DocumentChunk.deleteMany({
        documentId: document._id,
      }).catch(() => {});

      await Document.findByIdAndUpdate(document._id, {
        status: "failed",
        errorMessage: error.message,
      }).catch(() => {});
    }

    next(error);
  }
};

// Get document details
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Delete document and its chunks
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    await DocumentChunk.deleteMany({
      documentId: document._id,
    });

    await Document.findByIdAndDelete(document._id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocument,
  deleteDocument,
};
