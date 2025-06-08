import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'http://localhost:3000';

export const useAttractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Refs pentru a controla requesturile
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const lastRequestTypeRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Obține locația utilizatorului
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          setUserLocation(location);
          setLocationError(null);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Could not get your location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }, []);

  // Fetch nearby attractions
  const fetchNearbyAttractions = useCallback(async (lat, lng, radius = 50) => {
    // Cleanup previous request
    cleanup();
    
    const requestType = 'nearby';
    lastRequestTypeRef.current = requestType;
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/api/attractions/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      console.log('🔍 Fetching nearby attractions:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal
      });
      
      // Check if this request is still current
      if (lastRequestTypeRef.current !== requestType) {
        console.log('🚫 Request outdated, ignoring response');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Received nearby attractions:', data?.length || 0);
      
      const transformedData = transformAttractions(data, lat, lng);
      setAttractions(transformedData);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 Nearby fetch aborted');
        return;
      }
      
      // Check if this request is still current
      if (lastRequestTypeRef.current !== requestType) {
        return;
      }
      
      console.error('❌ Error fetching nearby attractions:', err);
      throw err;
    }
  }, [cleanup]);

  // Fetch all attractions
  const fetchAllAttractions = useCallback(async () => {
    // Cleanup previous request
    cleanup();
    
    const requestType = 'all';
    lastRequestTypeRef.current = requestType;
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching all attractions');
      
      const response = await fetch(`${API_BASE_URL}/api/attractions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal
      });
      
      // Check if this request is still current
      if (lastRequestTypeRef.current !== requestType) {
        console.log('🚫 Request outdated, ignoring response');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Received all attractions:', data?.length || 0);
      
      const transformedData = transformAttractions(data, userLocation?.lat, userLocation?.lng);
      setAttractions(transformedData);
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 All fetch aborted');
        return;
      }
      
      // Check if this request is still current
      if (lastRequestTypeRef.current !== requestType) {
        return;
      }
      
      console.error('❌ Error fetching all attractions:', err);
      throw err;
    }
  }, [cleanup, userLocation]);

  // Transform attractions data
  const transformAttractions = useCallback((data, userLat, userLng) => {
    if (!Array.isArray(data)) {
      console.warn('Invalid attractions data:', data);
      return [];
    }

    return data.map(attraction => ({
      id: attraction.googlePlaceId || attraction._id,
      name: attraction.name || 'Unnamed Attraction',
      rating: attraction.rating || 0,
      distance: formatDistance(attraction.calculatedDistance, attraction.location, userLat, userLng),
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
      coordinates: attraction.location
    }));
  }, []);

  // Load nearby attractions
  const loadNearbyAttractions = useCallback(async () => {
    try {
      console.log('📍 Loading nearby attractions...');
      
      let location = userLocation;
      if (!location) {
        location = await getUserLocation();
      }
      
      await fetchNearbyAttractions(location.lat, location.lng);
      
    } catch (err) {
      console.error('❌ Error loading nearby attractions:', err);
      setError(err.message);
      
      // Fallback to all attractions
      try {
        await fetchAllAttractions();
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
        setAttractions(getMockAttractions());
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, getUserLocation, fetchNearbyAttractions, fetchAllAttractions]);

  // Refresh attractions
  const refreshAttractions = useCallback(async () => {
    try {
      console.log('🔄 Refreshing attractions...');
      await fetchAllAttractions();
    } catch (err) {
      console.error('❌ Error refreshing attractions:', err);
      setError(err.message);
      setAttractions(getMockAttractions());
    } finally {
      setLoading(false);
    }
  }, [fetchAllAttractions]);

  // Initial load
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    
    const initLoad = async () => {
      try {
        await fetchAllAttractions();
      } catch (err) {
        console.error('❌ Initial load failed:', err);
        setError(err.message);
        setAttractions(getMockAttractions());
      } finally {
        setLoading(false);
      }
    };

    initLoad();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [fetchAllAttractions, cleanup]);

  return {
    attractions,
    loading,
    error,
    userLocation,
    locationError,
    refreshAttractions,
    loadNearbyAttractions
  };
};

// Helper functions
const formatDistance = (calculatedDistance, attractionLocation, userLat, userLng) => {
  // Use backend calculated distance if available
  if (typeof calculatedDistance === 'number') {
    if (calculatedDistance < 1) {
      return `${Math.round(calculatedDistance * 1000)} m`;
    } else {
      return `${calculatedDistance.toFixed(1)} km`;
    }
  }

  // Fallback to manual calculation
  if (!attractionLocation?.lat || !attractionLocation?.lng || !userLat || !userLng) {
    return 'N/A';
  }

  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(attractionLocation.lat - userLat);
  const dLng = deg2rad(attractionLocation.lng - userLng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(attractionLocation.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
};

const deg2rad = (deg) => deg * (Math.PI/180);

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
  
  return openingHours[0] || 'Hours not available';
};

const getMockAttractions = () => [
  {
    id: 'mock-1',
    name: 'Catedrala Mitropolitană',
    rating: 4.5,
    distance: '1.2 km',
    type: 'landmark',
    imageUrl: '/default-attraction.jpg',
    description: 'Catedrala Mitropolitană din Timișoara',
    hours: '9:00 AM – 6:00 PM',
    price: 'Free',
    contact: '+40 256 491 210',
    location: 'Bulevardul Regele Ferdinand I, Timișoara',
    coordinates: { lat: 45.7533, lng: 21.2268 }
  },
  {
    id: 'mock-2',
    name: 'Castelul Huniade',
    rating: 4.3,
    distance: '2.1 km',
    type: 'museum',
    imageUrl: '/default-attraction.jpg',
    description: 'Castelul Huniade din Timișoara',
    hours: '10:00 AM – 6:00 PM',
    price: '10 RON',
    contact: '+40 256 491 592',
    location: 'Str. Căpitan Aurel Vlaicu, Timișoara',
    coordinates: { lat: 45.7597, lng: 21.2294 }
  }
];