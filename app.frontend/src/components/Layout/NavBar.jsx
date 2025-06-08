import React from 'react';

const NavBar = ({ darkMode, onToggleTheme }) => {
  return (
    <div className={`fixed top-0 left-0 w-full z-10 px-4 py-3 flex items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h1 className="text-xl font-semibold">GeziAPP</h1>
      <button 
        onClick={onToggleTheme} 
        className="cursor-pointer p-2 rounded-full"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <span className="text-yellow-400">☀️</span>
        ) : (
          <span className="text-gray-600">🌙</span>
        )}
      </button>
    </div>
  );
};

export default NavBar;