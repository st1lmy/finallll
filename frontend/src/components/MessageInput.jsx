// src/components/MessageInput.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const MessageInput = ({ onSend }) => {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const onDrop = useCallback(
    (files) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        onSend(text);
      };
      reader.readAsText(files[0]);
    },
    [onSend]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="input-area">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Отпустите файл, чтобы загрузить</p>
        ) : (
          <p>Перетащите файл или кликните сюда</p>
        )}
      </div>
      <textarea
        className="area"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Введите текст..."
      />
      <button onClick={send}>Отправить</button>
    </div>
  );
};

export default MessageInput;
