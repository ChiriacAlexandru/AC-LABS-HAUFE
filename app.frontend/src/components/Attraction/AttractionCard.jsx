import React from 'react';

const AttractionCard = ({ attraction, onClick, darkMode }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'landmark':
        return 'bg-red-100 text-red-800';
      case 'museum':
        return 'bg-amber-100 text-amber-800';
      case 'park':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div 
      onClick={() => onClick(attraction.id)}
      className={`flex-shrink-0 w-64 rounded-xl overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}
      style={{borderRadius: '12px'}}
    >
      <div className="h-32 overflow-hidden">
        <img 
          src={attraction.imageUrl} 
          alt={attraction.name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium">{attraction.name}</h3>
          <div className={`text-xs px-2 py-1 rounded-full ${getTypeColor(attraction.type)} ${darkMode && 'bg-opacity-20'}`}>
            {attraction.type}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-500 mr-1 text-xs">📍</span>
            <span className="text-xs text-gray-500">{attraction.distance}</span>
          </div>
          <div className="flex items-center">
            <span className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} mr-1`}>⭐</span>
            <span className="text-xs">{attraction.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;