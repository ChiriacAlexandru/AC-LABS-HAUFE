import React from 'react';

const BottomTabBar = ({ darkMode }) => {
  return (
    <div className={`fixed bottom-0 left-0 w-full grid grid-cols-5 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'} shadow-lg z-10`}>
      <button className={`flex flex-col items-center justify-center py-2 cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        <span className="text-lg">🧭</span>
        <span className="text-xs mt-1">Explore</span>
      </button>
      <button className="flex flex-col items-center justify-center py-2 cursor-pointer text-gray-500">
        <span className="text-lg">🔍</span>
        <span className="text-xs mt-1">Search</span>
      </button>
      <button className="flex flex-col items-center justify-center py-2 cursor-pointer text-gray-500">
        <span className="text-lg">🗺️</span>
        <span className="text-xs mt-1">Map</span>
      </button>
      <button className="flex flex-col items-center justify-center py-2 cursor-pointer text-gray-500">
        <span className="text-lg">❤️</span>
        <span className="text-xs mt-1">Saved</span>
      </button>
      <button className="flex flex-col items-center justify-center py-2 cursor-pointer text-gray-500">
        <span className="text-lg">👤</span>
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
};

export default BottomTabBar;