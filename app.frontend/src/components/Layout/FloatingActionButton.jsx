import React from 'react';

const FloatingActionButton = ({ darkMode }) => {
  return (
    <button 
      className={`fixed right-4 bottom-20 p-4 rounded-full shadow-lg cursor-pointer ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white z-20`}
      style={{borderRadius: '50%'}}
    >
      <span className="text-lg">🛣️</span>
    </button>
  );
};

export default FloatingActionButton;