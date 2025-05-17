// src/components/ImageAnonymizer.jsx
import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import nlp from "compromise";
import { v4 as uuidv4 } from "uuid";

export default function ImageAnonymizer() {
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const imgRef = useRef();
  const canvasRef = useRef();

  const onDrop = useCallback(async (files) => {
    setProcessing(true);
    setOutputUrl(null);

    // 1. Показываем исходник в скрытом img для получения размеров
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    imgRef.current.src = objectUrl;
    await new Promise((r) => (imgRef.current.onload = r));

    // 2. OCR
    const result = await Tesseract.recognize(file, "rus+eng");
    console.log("Результат Tesseract:", result);

    const words = result?.data?.words;

    if (!words || !Array.isArray(words)) {
      console.error("Ошибка: words не определены или не массив");
      setProcessing(false);
      return;
    }


    // 3. Ищем PII по каждому слову
    const boxes = [];
    for (const { text, bbox } of words) {
      const clean = text.trim();
      if (!clean) continue;
      const doc = nlp(clean);
      const isPII =
        doc.people().length > 0 ||
        doc.places().length > 0 ||
        doc.organizations().length > 0 ||
        /^\d{12}$/.test(clean);
      if (isPII) {
        boxes.push({
          x: bbox.x0,
          y: bbox.y0,
          w: bbox.x1 - bbox.x0,
          h: bbox.y1 - bbox.y0,
        });
      }
    }

    // 4. Рисуем на canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = imgRef.current.naturalWidth;
    canvas.height = imgRef.current.naturalHeight;
    ctx.drawImage(imgRef.current, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    for (const b of boxes) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    // 5. Экспортируем результат
    canvas.toBlob(
      (blob) => {
        setOutputUrl(URL.createObjectURL(blob));
        setProcessing(false);
        URL.revokeObjectURL(objectUrl);
      },
      "image/jpeg",
      0.9
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div style={{ textAlign: "center", color: "#fff" }}>
      <h2>Анонимизатор Фото</h2>
      <div
        {...getRootProps()}
        style={{
          margin: "auto",
          padding: 20,
          border: "2px dashed #888",
          borderRadius: 8,
          width: 300,
          cursor: "pointer",
          background: isDragActive ? "#333" : "transparent",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Отпустите изображение для анонимизации</p>
        ) : (
          <p>Перетащите фото или кликните</p>
        )}
      </div>
      {processing && <p>Обработка изображения…</p>}
      <div style={{ marginTop: 20 }}>
        <img ref={imgRef} alt="" style={{ display: "none" }} />
        <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
      </div>
      {outputUrl && (
        <a
          href={outputUrl}
          download={`anon-${uuidv4()}.jpg`}
          style={{
            display: "inline-block",
            marginTop: 15,
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Скачать анонимизированное фото
        </a>
      )}
    </div>
  );
}
