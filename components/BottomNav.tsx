
import React from 'react';
import { Screen, NavItem } from '../types';
import { HomeIcon, NewspaperIcon, CalendarIcon, ChatBubbleOvalLeftEllipsisIcon, DocumentPlusIcon } from './Icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const navItems: NavItem[] = [
  { screen: Screen.Home, icon: HomeIcon },
  { screen: Screen.News, icon: NewspaperIcon },
  { screen: Screen.Chat, icon: ChatBubbleOvalLeftEllipsisIcon },
  { screen: Screen.Calendar, icon: CalendarIcon },
  { screen: Screen.Report, icon: DocumentPlusIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-t-lg">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => setActiveScreen(item.screen)}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors duration-200 ${
              activeScreen === item.screen
                ? 'text-[#003366] dark:text-sky-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#003366] dark:hover:text-sky-300'
            }`}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.screen}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;