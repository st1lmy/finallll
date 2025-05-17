// frontend/src/components/ImageAnonymizer.jsx
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Tesseract from "tesseract.js";
import nlp from "compromise";




fetch("http://localhost:3001/upload", {
  method: "POST",
});



export default function ImageAnonymizer() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef();

  const anonymizeText = (text) => {
    const doc = nlp(text);
    doc.people().replaceWith("[NAME]");
    doc.places().replaceWith("[PLACE]");
    doc.organizations().replaceWith("[ORG]");
    const noPhones = text.replace(/\+?\d{10,}/g, "[PHONE]");
    const noAddresses = noPhones.replace(
      /ул\.|улица|проспект|дом\s\d+/gi,
      "[ADDRESS]"
    );
    return doc.text().replace(text, noAddresses);
  };

  const onDrop = useCallback(async (files) => {
    setProcessing(true);
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    imgRef.current.src = imageUrl;
    await new Promise((r) => (imgRef.current.onload = r));

    const result = await Tesseract.recognize(file, "rus+eng");
    const rawText = result.data.text;
    const cleaned = anonymizeText(rawText);
    setInputText(cleaned);
    setProcessing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSend = async () => {
    if (!inputText) return;
    setProcessing(true);
    const res = await fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: inputText }),
    });
    const data = await res.json();
    setOutputText(data.text);
    setProcessing(false);
  };

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto", color: "#fff" }}>
      <h2>📷 Анонимизатор Фото / Текста</h2>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #888",
          padding: 20,
          cursor: "pointer",
          borderRadius: 8,
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Отпустите изображение</p>
        ) : (
          <p>Перетащите фото или кликните для загрузки</p>
        )}
      </div>

      <img ref={imgRef} alt="preview" style={{ display: "none" }} />

      <textarea
        placeholder="Или вставьте текст вручную..."
        rows={8}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ width: "100%", marginTop: 20, padding: 10 }}
      />

      <button
        onClick={handleSend}
        disabled={processing}
        style={{ marginTop: 20 }}
      >
        {processing ? "Обработка..." : "Отправить в Gemini"}
      </button>

      {outputText && (
        <div
          style={{
            marginTop: 30,
            background: "#222",
            padding: 20,
            borderRadius: 8,
          }}
        >
          <h4>💡 Ответ</h4>
          <pre>{outputText}</pre>
        </div>
      )}
    </div>
  );
}
