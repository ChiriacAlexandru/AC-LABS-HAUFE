import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { attractionService } from '../services/attractionService';

const AttractionContext = createContext();

const initialState = {
  attractions: [],
  loading: false,
  error: null,
  selectedAttraction: null,
  userLocation: null,
  locationError: null,
  isNearbyMode: false
};

const attractionReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, attractions: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SELECT_ATTRACTION':
      return { ...state, selectedAttraction: action.payload };
    case 'CLEAR_SELECTION':
      return { ...state, selectedAttraction: null };
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload, locationError: null };
    case 'SET_LOCATION_ERROR':
      return { ...state, locationError: action.payload };
    case 'SET_NEARBY_MODE':
      return { ...state, isNearbyMode: action.payload };
    default:
      return state;
  }
};

// Funcție pentru transformarea datelor
const transformAttractionData = (attractions, userLocation) => {
  return attractions.map(attraction => ({
    id: attraction.googlePlaceId || attraction._id,
    name: attraction.name || 'Unnamed Attraction',
    rating: attraction.rating || 0,
    distance: formatDistance(attraction.calculatedDistance),
    type: mapCategoryToType(attraction.category),
    imageUrl: attraction.photos?.[0] || '/default-attraction.jpg',
    description: attraction.formattedAddress || 'No description available',
    hours: formatOpeningHours(attraction.openingHours),
    price: 'Free',
    contact: attraction.phoneNumber || 'N/A',
    location: attraction.formattedAddress || 'Unknown location',
    website: attraction.website,
    googleMapsUrl: attraction.url,
    cityInfo: attraction.cityId,
    coordinates: attraction.location,
    rawData: attraction // păstrăm datele originale pentru debug
  }));
};

// Helper functions
const formatDistance = (calculatedDistance) => {
  if (typeof calculatedDistance === 'number') {
    if (calculatedDistance < 1) {
      return `${Math.round(calculatedDistance * 1000)} m`;
    } else {
      return `${calculatedDistance.toFixed(1)} km`;
    }
  }
  return 'N/A';
};

const mapCategoryToType = (category) => {
  if (!category) return 'attraction';
  
  const categoryMap = {
    'landmark': 'landmark',
    'museum': 'museum',
    'park': 'park',
    'restaurant': 'restaurant',
    'tourist_attraction': 'attraction',
    'point_of_interest': 'attraction'
  };
  
  return categoryMap[category.toLowerCase()] || 'attraction';
};

const formatOpeningHours = (openingHours) => {
  if (!openingHours || !openingHours.length) {
    return 'Hours not available';
  }
  
  const today = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[today];
  
  const todayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(currentDayName.toLowerCase())
  );
  
  if (todayHours) {
    const timeMatch = todayHours.match(/(\d{1,2}:\d{2}\s*[AP]M\s*–\s*\d{1,2}:\d{2}\s*[AP]M)/i);
    return timeMatch ? timeMatch[1] : todayHours;
  }
  
  return openingHours[0] || 'Hours not available';
};

export const AttractionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(attractionReducer, initialState);

  // Obține locația utilizatorului
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          console.log('📍 User location obtained:', location);
          dispatch({ type: 'SET_USER_LOCATION', payload: location });
          resolve(location);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          let errorMessage = 'Could not get your location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          dispatch({ type: 'SET_LOCATION_ERROR', payload: errorMessage });
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minute cache
        }
      );
    });
  };

  // Fetch toate atracțiile
  const fetchAttractions = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      console.log('🔍 Fetching all attractions...');
      const data = await attractionService.getAllAttractions();
      const transformedData = transformAttractionData(data, state.userLocation);
      dispatch({ type: 'FETCH_SUCCESS', payload: transformedData });
      dispatch({ type: 'SET_NEARBY_MODE', payload: false });
    } catch (error) {
      console.error('❌ Error fetching attractions:', error);
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };

  // Fetch atracții din apropiere
  const fetchNearbyAttractions = async (userLocation = null) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      let location = userLocation || state.userLocation;
      
      // Dacă nu avem locația, încearcă să o obții
      if (!location) {
        location = await getUserLocation();
      }
      
      console.log('🔍 Fetching nearby attractions for location:', location);
      const data = await attractionService.getNearbyAttractions(location.lat, location.lng, 50);
      const transformedData = transformAttractionData(data, location);
      
      dispatch({ type: 'FETCH_SUCCESS', payload: transformedData });
      dispatch({ type: 'SET_NEARBY_MODE', payload: true });
      
    } catch (error) {
      console.error('❌ Error fetching nearby attractions:', error);
      dispatch({ type: 'SET_LOCATION_ERROR', payload: error.message });
      
      // Fallback la toate atracțiile
      await fetchAttractions();
    }
  };

  // Selectează o atracție
  const selectAttraction = (attractionId) => {
    const attraction = state.attractions.find(a => a.id === attractionId);
    dispatch({ type: 'SELECT_ATTRACTION', payload: attraction });
  };

  // Curăță selecția
  const clearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  // Refresh atracții
  const refreshAttractions = () => {
    if (state.isNearbyMode && state.userLocation) {
      fetchNearbyAttractions();
    } else {
      fetchAttractions();
    }
  };

  // Load la startup
  useEffect(() => {
    fetchAttractions();
  }, []);

  const contextValue = {
    // State
    ...state,
    
    // Actions
    fetchAttractions,
    fetchNearbyAttractions,
    selectAttraction,
    clearSelection,
    refreshAttractions,
    getUserLocation
  };

  return (
    <AttractionContext.Provider value={contextValue}>
      {children}
    </AttractionContext.Provider>
  );
};

export const useAttractionContext = () => {
  const context = useContext(AttractionContext);
  if (!context) {
    throw new Error('useAttractionContext must be used within AttractionProvider');
  }
  return context;
};