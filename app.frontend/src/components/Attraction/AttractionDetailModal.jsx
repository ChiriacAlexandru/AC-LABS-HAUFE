import React from 'react';

const AttractionDetailModal = ({ attraction, isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

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
    <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="relative h-full overflow-y-auto">
        {/* Modal Handle */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-2 z-10">
          <div className={`w-12 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black bg-opacity-30 text-white cursor-pointer"
        >
          <span>✕</span>
        </button>
        
        {/* Attraction Image */}
        <div className="h-64 w-full">
          <img 
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
        
        {/* Attraction Details */}
        <div className="px-4 py-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-2xl font-semibold">{attraction.name}</h2>
            <div className={`text-sm px-3 py-1 rounded-full ${getTypeColor(attraction.type)} ${darkMode && 'bg-opacity-20'}`}>
              {attraction.type}
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-500'} mr-1`}>⭐</span>
              <span>{attraction.rating}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">📍</span>
              <span className="text-gray-500">{attraction.distance}</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="font-medium mb-2">Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Hours</p>
                <p>{attraction.hours}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Price</p>
                <p>{attraction.price}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Contact</p>
                <p>{attraction.contact}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm leading-relaxed">{attraction.description}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              className={`flex-1 py-3 rounded-lg cursor-pointer flex items-center justify-center ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}
              style={{borderRadius: '8px'}}
            >
              <span className="mr-2">🧭</span>
              <span>Directions</span>
            </button>
            <button 
              className={`flex-1 py-3 rounded-lg cursor-pointer flex items-center justify-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'}`}
              style={{borderRadius: '8px'}}
            >
              <span className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🔖</span>
              <span>Save</span>
            </button>
            <button 
              className={`flex-1 py-3 rounded-lg cursor-pointer flex items-center justify-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'}`}
              style={{borderRadius: '8px'}}
            >
              <span className="mr-2">📤</span>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetailModal;