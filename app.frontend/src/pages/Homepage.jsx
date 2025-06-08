import React, { useState } from 'react';

// Layout components
import NavBar from '../components/Layout/NavBar';
import BottomTabBar from '../components/Layout/BottomTabBar';
import FloatingActionButton from '../components/Layout/FloatingActionButton';

// Map components
import MapView from '../components/Map/MapView';

// Search components
import SearchContainer from '../components/Search/SearchContainer';

// Attraction components
import AttractionsCarousel from '../components/Attraction/AttractionsCarousel';
import AttractionDetailModal from '../components/Attraction/AttractionDetailModal';

// Custom hook for attractions
import { useAttractions } from '../hooks/useAttractions';

const Homepage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Stări pentru funcționalitatea de traseu
  const [searchDestination, setSearchDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);

  // Hook pentru atracții cu geolocalizare
  const { 
    attractions, 
    loading, 
    error, 
    userLocation, 
    locationError,
    refreshAttractions,
    loadNearbyAttractions 
  } = useAttractions();

  // Event Handlers
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleLocationSearch(suggestion);
  };

  const handleLocationSearch = async (destination) => {
    setIsSearching(true);
    setSearchDestination(destination);
    setShowSuggestions(false);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  const handleRouteCalculated = (routeData) => {
    setRouteInfo(routeData);
  };

  const handleCurrentPositionUpdate = (position) => {
    setCurrentPosition(position);
  };

  const clearRoute = () => {
    setRouteInfo(null);
    setSearchDestination('');
    setSearchQuery('');
  };

  const handleAttractionClick = (id) => {
    setSelectedAttraction(id);
    setDetailModalOpen(true);
    
    const attraction = attractions.find(a => a.id === id);
    if (attraction && attraction.location) {
      const destinationString = `${attraction.name}`;
      setSearchQuery(destinationString);
      handleLocationSearch(destinationString);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
  };

  const selectedAttractionData = selectedAttraction !== null 
    ? attractions.find(a => a.id === selectedAttraction) 
    : null;

  // Loading state
  if (loading) {
    return (
      <div className={`relative min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <NavBar darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="pt-16 pb-20 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3">
              {userLocation ? 'Finding nearby attractions...' : 'Loading attractions...'}
            </span>
          </div>
        </div>
        <BottomTabBar darkMode={darkMode} />
        <FloatingActionButton darkMode={darkMode} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <NavBar darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="pt-16 pb-20 px-4">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">Error loading attractions: {error}</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={refreshAttractions}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={loadNearbyAttractions}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                📍 Try Near Me
              </button>
            </div>
          </div>
        </div>
        <BottomTabBar darkMode={darkMode} />
        <FloatingActionButton darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <NavBar darkMode={darkMode} toggleTheme={toggleTheme} />
      
      {/* Main Content */}
      <div className="pt-16 pb-20 px-4">
        <SearchContainer
          darkMode={darkMode}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showSuggestions={showSuggestions}
          suggestions={[]}
          onSelectSuggestion={handleSelectSuggestion}
          onLocationSearch={handleLocationSearch}
          isSearching={isSearching}
          currentPosition={currentPosition}
        />

        {/* Route Info Panel */}
        {routeInfo && (
          <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'} shadow-md`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  🗺️ Informații traseu
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📍</span>
                    <span className="font-medium">{routeInfo.distance}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">🕒</span>
                    <span className="font-medium">{routeInfo.duration}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div className="truncate">Către: {routeInfo.endAddress}</div>
                </div>
              </div>
              <button
                onClick={clearRoute}
                className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Șterge traseu"
              >
                ✕
              </button>
            </div>
          </div>
        )}

    <MapView 
  darkMode={darkMode} 
  attractions={attractions}  // Add this
  userLocation={userLocation}  // Add this
  searchDestination={searchDestination}
  onRouteCalculated={handleRouteCalculated}
  onCurrentPositionUpdate={handleCurrentPositionUpdate}
  onAttractionMarkerClick={handleAttractionClick}  // Add this
  selectedAttraction={selectedAttraction}  // Add this
/>
        
        {/* Attractions Carousel cu funcționalitatea Near You */}
        <div className="space-y-3">
          {attractions.length > 0 ? (
            <AttractionsCarousel 
              darkMode={darkMode} 
              attractions={attractions}
              onAttractionClick={handleAttractionClick}
              userLocation={userLocation}
              locationError={locationError}
              onLoadNearby={loadNearbyAttractions}
            />
          ) : (
            <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <p className="text-gray-500 mb-3">
                {locationError ? 'No attractions found nearby' : 'No attractions found'}
              </p>
              
              {/* Status locație */}
              {locationError && (
                <div className={`mb-3 p-2 rounded text-xs ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                  <span className="mr-1">⚠️</span>
                  {locationError}
                </div>
              )}
              
              {userLocation && (
                <div className={`mb-3 p-2 rounded text-xs ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                  <span className="mr-1">📍</span>
                  Location found: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              )}
              
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={refreshAttractions}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Refresh All
                </button>
                <button 
                  onClick={loadNearbyAttractions}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  📍 Near Me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomTabBar darkMode={darkMode} />
      <FloatingActionButton darkMode={darkMode} />

      {/* Attraction Detail Modal */}
      {detailModalOpen && selectedAttractionData && (
        <AttractionDetailModal
          darkMode={darkMode}
          attraction={selectedAttractionData}
          closeDetailModal={closeDetailModal}
        />
      )}
    </div>
  );
};

export default Homepage;