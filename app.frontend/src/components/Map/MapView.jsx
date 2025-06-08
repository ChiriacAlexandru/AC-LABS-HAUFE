import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';

const CONTAINER_STYLE = { width: '100%', height: '100%', borderRadius: '0.75rem' };
const DEFAULT_POSITION = { lat: 45.7489, lng: 21.2087 }; // Timișoara
const GOOGLE_MAPS_LIBRARIES = ['geometry', 'places'];
const LOAD_SCRIPT_TIMEOUT = 10000;

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

const MapView = ({
  darkMode,
  attractions = [],
  userLocation,
  searchDestination,
  onRouteCalculated,
  onCurrentPositionUpdate,
  onAttractionMarkerClick,
  selectedAttraction,
}) => {
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const lastSearchDestination = useRef(null);
  const isCalculatingRef = useRef(false);
  const loadTimeoutRef = useRef(null);

  const [zoom, setZoom] = useState(12);
  const [currentPosition, setCurrentPosition] = useState(userLocation || DEFAULT_POSITION);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [directions, setDirections] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [infoWindowAttraction, setInfoWindowAttraction] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const mapId = useMemo(() => 
    `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  const mapOptions = useMemo(() => ({
    mapId: mapId,
    styles: darkMode ? DARK_MAP_STYLE : [],
    disableDefaultUI: false,
    gestureHandling: 'greedy',
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  }), [darkMode, mapId]);

  const directionsRendererOptions = useMemo(() => ({
    suppressMarkers: false,
    polylineOptions: { 
      strokeColor: '#4285F4', 
      strokeWeight: 4, 
      strokeOpacity: 0.8 
    }
  }), []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    isCalculatingRef.current = false;
  }, []);

  // Update current position if userLocation changes
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      setCurrentPosition(userLocation);
      console.log('📍 Updated current position from props:', userLocation);
    }
  }, [userLocation]);

  // Center and open info for selected attraction
  useEffect(() => {
    if (!selectedAttraction || !isGoogleMapsLoaded || !mapRef.current) return;
    
    const found = attractions.find(a => a.id === selectedAttraction);
    if (found && found.coordinates?.lat && found.coordinates?.lng) {
      try {
        mapRef.current.panTo({ 
          lat: found.coordinates.lat, 
          lng: found.coordinates.lng 
        });
        mapRef.current.setZoom(15);
        setInfoWindowAttraction(found.id);
        console.log('🎯 Centered map on selected attraction:', found.name);
      } catch (error) {
        console.error('Error centering on attraction:', error);
      }
    }
  }, [selectedAttraction, isGoogleMapsLoaded, attractions]);

  // Handle Google Maps load
  const handleMapLoad = useCallback((map) => {
    try {
      mapRef.current = map;
      
      // Verifică dacă Google Maps API este disponibil
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        geocoderRef.current = new window.google.maps.Geocoder();
        
        setIsGoogleMapsLoaded(true);
        setLoadError(null);
        
        console.log('✅ Google Maps loaded successfully');
        
        // Clear timeout dacă totul e OK
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
      } else {
        throw new Error('Google Maps API not available');
      }
    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      setLoadError(error.message);
      setIsGoogleMapsLoaded(false);
    }
  }, []);

  // Handle load error
  const handleLoadError = useCallback((error) => {
    console.error('❌ LoadScript error:', error);
    setLoadError('Failed to load Google Maps');
    setIsGoogleMapsLoaded(false);
    cleanup();
  }, [cleanup]);

  // Rutare Google Maps
  useEffect(() => {
    if (
      searchDestination &&
      isGoogleMapsLoaded &&
      searchDestination !== lastSearchDestination.current &&
      !isCalculatingRef.current &&
      geocoderRef.current &&
      directionsServiceRef.current
    ) {
      isCalculatingRef.current = true;
      lastSearchDestination.current = searchDestination;
      setIsCalculatingRoute(true);
      setDirections(null);
      setDestinationMarker(null);

      console.log('🗺️ Calculating route to:', searchDestination);

      geocoderRef.current.geocode({ address: searchDestination }, (results, status) => {
        try {
          if (status !== 'OK' || !results || !results[0]) {
            console.warn('❌ Geocoding failed:', status);
            setIsCalculatingRoute(false);
            isCalculatingRef.current = false;
            return;
          }

          const destinationLocation = results[0].geometry.location;
          const destinationPosition = {
            lat: destinationLocation.lat(),
            lng: destinationLocation.lng()
          };
          
          setDestinationMarker(destinationPosition);

          const request = {
            origin: currentPosition,
            destination: destinationPosition,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            language: 'ro',
            provideRouteAlternatives: false,
            optimizeWaypoints: true
          };

          directionsServiceRef.current.route(request, (result, status) => {
            setIsCalculatingRoute(false);
            isCalculatingRef.current = false;
            
            if (status === 'OK' && result) {
              setDirections(result);
              const route = result.routes[0];
              const leg = route.legs[0];
              
              const routeData = {
                distance: leg.distance.text,
                duration: leg.duration.text,
                startAddress: leg.start_address,
                endAddress: leg.end_address,
                bounds: route.bounds
              };
              
              onRouteCalculated?.(routeData);
              
              // Fit bounds pentru a arăta întregul traseu
              if (mapRef.current && route.bounds) {
                mapRef.current.fitBounds(route.bounds, {
                  top: 50, right: 50, bottom: 50, left: 50
                });
              }
              
              console.log('✅ Route calculated successfully');
            } else {
              console.warn('❌ Directions failed:', status);
              // Centrează pe destinație dacă nu putem calcula traseu
              if (mapRef.current) {
                mapRef.current.panTo(destinationPosition);
                mapRef.current.setZoom(15);
              }
            }
          });
          
        } catch (error) {
          console.error('❌ Error in route calculation:', error);
          setIsCalculatingRoute(false);
          isCalculatingRef.current = false;
        }
      });
    }
  }, [searchDestination, isGoogleMapsLoaded, currentPosition, onRouteCalculated]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Set timeout pentru loading
  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        setLoadError('Google Maps loading timeout');
        console.error('❌ Google Maps loading timeout');
      }
    }, LOAD_SCRIPT_TIMEOUT);
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isGoogleMapsLoaded]);

  // Render error state
  if (!apiKey) {
    return (
      <div className={`relative rounded-xl overflow-hidden mb-4 ${darkMode ? 'border border-gray-700' : 'border border-gray-200'} shadow-md`} style={{ height: '16rem' }}>
        <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm text-gray-500">Map View</p>
            <p className="text-xs text-red-500">Google Maps API Key Missing</p>
            <p className="text-xs text-gray-400 mt-1">Check your environment variables</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`relative rounded-xl overflow-hidden mb-4 ${darkMode ? 'border border-gray-700' : 'border border-gray-200'} shadow-md`} style={{ height: '16rem' }}>
        <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div className="text-center">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-sm text-red-500">Map Loading Error</p>
            <p className="text-xs text-gray-400 mt-1">{loadError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden mb-4 ${darkMode ? 'border border-gray-700' : 'border border-gray-200'} shadow-md`} style={{ height: '16rem' }}>
      {/* Loading overlay */}
      {!isGoogleMapsLoaded && (
        <div className={`absolute inset-0 z-10 flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

      {/* Route calculation overlay */}
      {isCalculatingRoute && (
        <div className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-white border-t-transparent border-2 mr-2"></div>
          Calculating route...
        </div>
      )}

      <LoadScript
        googleMapsApiKey={apiKey}
        language="ro"
        libraries={GOOGLE_MAPS_LIBRARIES}
        onLoad={() => console.log('📊 LoadScript onLoad called')}
        onError={handleLoadError}
        loadingElement={<div>Loading...</div>}
      >
        <GoogleMap
          mapContainerStyle={CONTAINER_STYLE}
          center={currentPosition}
          zoom={zoom}
          onLoad={handleMapLoad}
          options={mapOptions}
          onZoomChanged={() => {
            if (mapRef.current) {
              setZoom(mapRef.current.getZoom());
            }
          }}
        >
          {/* Markeri pentru atracții */}
          {isGoogleMapsLoaded && attractions.map(attraction => (
            attraction.coordinates?.lat && attraction.coordinates?.lng && (
              <Marker
                key={`attraction-${attraction.id}`}
                position={{ 
                  lat: Number(attraction.coordinates.lat), 
                  lng: Number(attraction.coordinates.lng) 
                }}
                icon={{
                  url: attraction.id === selectedAttraction
                    ? 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png'
                    : 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                onClick={() => {
                  setInfoWindowAttraction(attraction.id);
                  onAttractionMarkerClick?.(attraction.id);
                }}
                title={attraction.name}
              >
                {infoWindowAttraction === attraction.id && (
                  <InfoWindow onCloseClick={() => setInfoWindowAttraction(null)}>
                    <div style={{ minWidth: 120, maxWidth: 200 }}>
                      <strong>{attraction.name}</strong>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {attraction.type && <div>📍 {attraction.type}</div>}
                        {attraction.rating && <div>⭐ {attraction.rating}</div>}
                        {attraction.distance && <div>📏 {attraction.distance}</div>}
                      </div>
                      <button
                        onClick={() => {
                          onAttractionMarkerClick?.(attraction.id);
                          setInfoWindowAttraction(null);
                        }}
                        className="text-blue-500 underline text-xs mt-2 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            )
          ))}

          {/* Marker pentru current location */}
          {isGoogleMapsLoaded && currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                url: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
                scaledSize: new window.google.maps.Size(24, 24),
              }}
              title="Your Location"
            />
          )}

          {/* Marker pentru destinație */}
          {isGoogleMapsLoaded && destinationMarker && (
            <Marker
              position={destinationMarker}
              icon={{
                url: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              }}
              title="Destination"
            />
          )}

          {/* Directions */}
          {isGoogleMapsLoaded && directions && (
            <DirectionsRenderer
              directions={directions}
              options={directionsRendererOptions}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapView;