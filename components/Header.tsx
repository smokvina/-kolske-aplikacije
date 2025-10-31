
import React from 'react';
import { SchoolLogoIcon } from './Icons';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-[#003366] text-white p-4 shadow-md flex items-center sticky top-0 z-10">
      <SchoolLogoIcon className="h-10 w-10 mr-3"/>
      <div>
        <h1 className="text-xl font-bold">Prometna Škola Split</h1>
        <p className="text-sm opacity-90">{title}</p>
      </div>
    </header>
  );
};

export default Header;