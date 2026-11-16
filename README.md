# DocuMind AI – Backend

Backend API for DocuMind AI, an AI-powered document analyser built with Node.js, Express.js, MongoDB, and Google's Gemini API.

## Features

- Upload PDF, DOCX, and TXT documents.
- Extract text from uploaded documents.
- Split document content into smaller chunks.
- Store document information and chunks in MongoDB.
- Generate document summaries using Gemini AI.
- Process documents in the background.
- Ask questions about uploaded documents.
- Retrieve relevant document chunks using MongoDB text search.
- Delete uploaded documents and their associated chunks.
- Centralized error handling.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Google Gemini API
- Multer
- PDF Parse
- Mammoth
- dotenv
- CORS

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── gemini.js
│   │
│   ├── controllers/
│   │   ├── DocumentController.js
│   │   └── ChatController.js
│   │
│   ├── middlewares/
│   │   ├── UploadMiddleware.js
│   │   └── ErrorMiddleware.js
│   │
│   ├── models/
│   │   ├── DocumentModel.js
│   │   └── DocumentChunkModel.js
│   │
│   ├── routes/
│   │   ├── DocumentRoutes.js
│   │   └── ChatRoutes.js
│   │
│   ├── services/
│   │   ├── DocumentParser.js
│   │   ├── AIService.js
│   │   └── ChunkText.js
│   │
│   ├── utils/
│   │
│   │
│   ├── index.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=gemini-3.8-flash
```

Replace the placeholder values with your actual credentials and configuration.

### 4. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The backend will run at:

```text
http://localhost:5000
```

## API Endpoints

Base URL:

```text
/api/v1
```

### Document APIs

| Method | Endpoint            | Description                                |
| ------ | ------------------- | ------------------------------------------ |
| POST   | `/documents/upload` | Upload a document                          |
| GET    | `/documents/:id`    | Get document details and processing status |
| DELETE | `/documents/:id`    | Delete document and its chunks             |

### Chat API

| Method | Endpoint    | Description                              |
| ------ | ----------- | ---------------------------------------- |
| POST   | `/chat/ask` | Ask questions about an uploaded document |

### Upload Document

**POST** `/api/v1/documents/upload`

Content-Type: `multipart/form-data`

Form field:

```text
file: document.pdf
```

The API accepts PDF, DOCX, and TXT files up to 15 MB.

The upload endpoint returns the document information immediately while background processing continues.

### Get Document Status

**GET** `/api/v1/documents/:id`

Used by the frontend to check the document processing status.

Possible statuses:

- `uploaded`
- `processing`
- `completed`
- `failed`

### Ask a Question

**POST** `/api/v1/chat/ask`

Request body:

```json
{
  "documentId": "DOCUMENT_ID",
  "message": "What is this document about?"
}
```

The response contains the AI-generated answer and relevant sources.

### Delete Document

**DELETE** `/api/v1/documents/:id`

Deletes the document and its associated document chunks.

## Document Processing Workflow

1. User uploads a document.
2. Backend creates a document record with `processing` status.
3. Background processing starts.
4. DocumentParser extracts the text.
5. ChunkText splits the extracted content into smaller chunks.
6. Document chunks are stored in MongoDB.
7. AIService generates a document summary using Gemini.
8. Document status is updated to `completed`.
9. Frontend can now enable document chat.

If processing fails, the document status is updated to `failed`.

## Question Answering Workflow

1. User submits a question.
2. Backend validates the document ID and processing status.
3. MongoDB text search retrieves relevant document chunks.
4. Relevant context is sent to Gemini.
5. Gemini generates an answer based on the retrieved context.
6. Backend returns the answer and sources.

## Important Notes

- Keep API credentials inside the backend `.env` file.
- Never expose your Gemini API key in the frontend.
- The current background processing implementation uses in-memory execution. A server restart can interrupt an ongoing job.
- MongoDB text search is keyword-based, not semantic search.
- Do not upload confidential documents when using an API configuration whose data-handling terms are unsuitable for that information.

## License

This project was created as a document analysis application.
