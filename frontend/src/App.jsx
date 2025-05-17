import React, { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");

  const handleTextChange = (e) => setText(e.target.value);

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleTextSubmit = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data.anonymized);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleImageSubmit = async () => {
    const formData = new FormData();
    formData.append("file", image);

    const response = await fetch(import.meta.env.VITE_API_URL + "/image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data.text);
  };

  return (
    <div style={}>
      <h1>Анонимизатор данных</h1>

      <div>
        <h2>Анонимизировать текст</h2>
        <textarea
          rows="5"
          value={text}
          onChange={handleTextChange}
          placeholder="Введите текст"
        />
        <button onClick={handleTextSubmit}>Анонимизировать текст</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Анонимизировать изображение</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleImageSubmit}>Анонимизировать изображение</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Результат</h2>
        <p>{result || "Здесь появится результат"}</p>
      </div>
    </div>
  );
}
