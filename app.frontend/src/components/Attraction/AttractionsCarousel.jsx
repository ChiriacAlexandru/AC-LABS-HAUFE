import React, { memo, useMemo } from 'react';
import AttractionCard from './AttractionCard';

const AttractionsCarousel = memo(({ 
  attractions, 
  onAttractionClick, 
  darkMode, 
  userLocation, 
  locationError, 
  onLoadNearby 
}) => {
  // Stabilizează array-ul și previne re-render-uri inutile
  const stableAttractions = useMemo(() => {
    if (!Array.isArray(attractions)) {
      console.warn('Attractions is not an array:', attractions);
      return [];
    }
    return attractions;
  }, [attractions]);

  const attractionCards = useMemo(() => {
    return stableAttractions.map((attraction) => (
      <AttractionCard
        key={attraction.id}
        attraction={attraction}
        onClick={onAttractionClick}
        darkMode={darkMode}
      />
    ));
  }, [stableAttractions, onAttractionClick, darkMode]);

  return (
    <div>
      {/* Attractions Heading cu buton Near You */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          {userLocation ? 'Nearby Attractions' : 'Attractions'}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({stableAttractions.length})
          </span>
        </h2>
        <div className="flex gap-2">
          {/* Buton Near You */}
          <button 
            onClick={onLoadNearby}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              userLocation 
                ? `${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}` 
                : `${darkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-gray-100'}`
            }`}
            title={locationError || 'Show attractions near your location'}
          >
            {userLocation ? '📍 Near You' : '📍 Near Me'}
          </button>
          
          <button className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            See All
          </button>
        </div>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className={`mb-3 p-2 rounded text-xs ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
          <span className="mr-1">⚠️</span>
          {locationError} - Showing all attractions
        </div>
      )}

      {userLocation && (
        <div className={`mb-3 p-2 rounded text-xs ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
          <span className="mr-1">📍</span>
          Showing attractions near your location
        </div>
      )}

      {/* Attractions Carousel */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3">
          {stableAttractions.length > 0 ? (
            attractionCards
          ) : (
            <div className={`flex-shrink-0 w-64 p-6 rounded-xl text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm mb-3">
                {userLocation ? 'No attractions found nearby' : 'No attractions available'}
              </p>
              <button 
                onClick={onLoadNearby}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                {userLocation ? 'Refresh nearby' : 'Find nearby attractions'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AttractionsCarousel.displayName = 'AttractionsCarousel';

export default AttractionsCarousel;