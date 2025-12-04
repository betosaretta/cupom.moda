import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatbotSuporte from './ChatbotSuporte';

export default function ChatbotButton({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chatbot */}
      <ChatbotSuporte 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
}