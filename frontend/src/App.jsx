import React, { useState, useCallback } from "react";
// Просто импортируем из пакета
import nlp from "compromise";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import ImageAnonymizer from './components/ImageAnonymizer';
import './App.css';





export default function App() {
  return (
    <div className="app-wrapper">
      {/* Можно оставить заголовок или обернуть компонент в контейнер */}
      <ImageAnonymizer />
    </div>
  );
}
