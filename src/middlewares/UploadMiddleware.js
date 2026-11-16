const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ["pdf", "docx", "txt"];

  const extension = path.extname(file.originalname).slice(1).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Only PDF, DOCX and TXT files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

module.exports = upload;
