
import React, { useState, useRef, useEffect } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';
import { SparklesIcon } from '../components/Icons';
import { logChatMessage } from '../services/googleSheetsService';

const ChatbotScreen: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(startChat());
    setMessages([{ sender: 'bot', text: 'Pozdrav! Ja sam AI asistent Prometne škole. Kako vam mogu pomoći danas?' }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || loading) return;

    const userMessageText = input;
    const userMessage: ChatMessage = { sender: 'user', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Log user message to Google Sheet
    logChatMessage('user', userMessageText);

    try {
      const result = await chat.sendMessageStream({ message: userMessageText });
      let botResponse = '';
      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

      for await (const chunk of result) {
        botResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = botResponse;
          return newMessages;
        });
      }
      // Log successful bot response to Google Sheet
      logChatMessage('bot', botResponse);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = 'Došlo je do pogreške. Pokušajte ponovno.';
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
      // Log error message to Google Sheet
      logChatMessage('bot', `[GREŠKA] ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col">
        <div className="mt-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <div className="bg-[#003366] rounded-full h-8 w-8 flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="h-5 w-5"/></div>}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#003366] text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}{loading && msg.sender === 'bot' && index === messages.length -1 && <span className="inline-block w-2 h-4 bg-gray-600 dark:bg-gray-300 ml-1 animate-pulse"></span>}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Unesite poruku..."
          className="flex-grow p-3 border rounded-full bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#003366] outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="bg-[#003366] text-white px-4 py-2 rounded-full hover:bg-[#004488] disabled:bg-gray-400"
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Pošalji'}
        </button>
      </div>
    </div>
  );
};

export default ChatbotScreen;