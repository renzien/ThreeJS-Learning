import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Avatar from './Avatar';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyDhjxhfQJ3k0LFfNwNrbYClASWiC15xXlA"; 
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [text, setText] = useState("Tekan Mic untuk bicara...");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser kamu tidak mendukung fitur suara. Coba pakai Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setText("Mendengarkan...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(`Kamu: "${transcript}"`);
      askGemini(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const askGemini = async (userMessage) => {
    try {
      setText("Gemini sedang berpikir...");
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Kamu adalah karakter anime virtual bernama Kanata.
        Sifatmu ceria, ramah, dan sedikit manja.
        Jawablah dengan bahasa Indonesia yang santai dan pendek saja (maksimal 2 kalimat).
        User berkata: "${userMessage}"
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const aiText = response.text();

      setText(`Kanata: "${aiText}"`);
      
      speak(aiText);

    } catch (error) {
      console.error(error);
      setText("Maaf, aku pusing (Error API).");
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; 
    utterance.pitch = 1.2; 
    utterance.rate = 1.0;  

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <div style={{
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 10,
        textAlign: 'center',
        width: '90%'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          marginBottom: '20px',
          fontSize: '16px',
          backdropFilter: 'blur(5px)'
        }}>
          {text}
        </div>

        <button 
          onClick={startListening}
          disabled={isListening || isSpeaking}
          style={{
            background: isListening ? '#ff4d4d' : '#4d79ff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {isListening ? '👂' : (isSpeaking ? '🔊' : '🎤')}
        </button>
      </div>

      <Canvas camera={{ position: [0, -0.4, 2.9], fov: 25 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} intensity={1} />
        <Suspense fallback={null}>
          <Avatar isSpeaking={isSpeaking} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;