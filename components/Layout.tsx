
import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import ChatFAB from './ChatFAB';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, setActiveScreen }) => {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-100 dark:bg-gray-800 shadow-2xl">
      <Header title={activeScreen} />
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {children}
      </main>
      {activeScreen !== Screen.Chat && <ChatFAB setActiveScreen={setActiveScreen} />}
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default Layout;