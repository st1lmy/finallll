import express from "express";
import multer from "multer";
import cors from "cors";
import { createWorker } from "tesseract.js";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/upload", upload.single("image"), async (req, res) => {
  const worker = await createWorker("rus+eng");

  const {
    data: { text },
  } = await worker.recognize(req.file.path);

  fs.unlinkSync(req.file.path); // удалить файл после обработки

  const anonymized = text
    .replace(/\b\d{12}\b/g, "[ИИН]")
    .replace(/\b[А-ЯЁ][а-яё]{2,}/g, "[ИМЯ]");

  res.json({ original: text, anonymized });
});

app.listen(3001, () => {
  console.log("Server running at http://localhost:3001");
});
