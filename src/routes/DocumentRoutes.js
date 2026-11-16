const express = require("express");
const router = express.Router();

const {
  uploadDocument,
  getDocument,
  deleteDocument,
} = require("../controllers/DocumentController");

const upload = require("../middlewares/UploadMiddleware");

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
