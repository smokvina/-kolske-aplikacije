
import React from 'react';
import { Screen } from '../types';
import { ChatBubbleOvalLeftEllipsisIcon } from './Icons';

interface ChatFABProps {
  setActiveScreen: (screen: Screen) => void;
}

const ChatFAB: React.FC<ChatFABProps> = ({ setActiveScreen }) => {
  return (
    <button
      onClick={() => setActiveScreen(Screen.Chat)}
      className="fixed bottom-24 right-4 z-20 h-16 w-16 bg-[#003366] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#004488] transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-300"
      aria-label="Otvori AI Chatbot"
    >
      <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
    </button>
  );
};

export default ChatFAB;