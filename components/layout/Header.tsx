import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl">🇮🇳</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">GovJobAlert</span>
          </a>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Home</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">All Jobs</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">Alerts</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">About Us</a>
          </nav>
        </div>
      </div>
    </header>
  );
};