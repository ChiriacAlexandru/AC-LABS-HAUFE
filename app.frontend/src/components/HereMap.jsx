import React, { useState, useEffect, useRef } from 'react';
import './HereMap.css';

const HereMap = ({ apiKey }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeGroup, setRouteGroup] = useState(null);

  // Inițializează harta
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        console.error("Containerul hărții nu a fost găsit");
        setError("Containerul hărții nu a fost găsit");
        setLoading(false);
        return;
      }

      try {
        if (!apiKey) {
          setError('Lipseste cheia API pentru HERE Maps');
          setLoading(false);
          return;
        }

        // Încarcă scripturile HERE Maps
        if (!window.H) {
          console.log('Încărcăm scripturile HERE Maps...');
          await loadHereMapsScript();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Așteaptă încărcarea completă
        }

        if (!window.H || !window.H.Map || !window.H.service) {
          throw new Error('HERE Maps API nu a fost încărcat corect');
        }

        console.log('HERE Maps a fost încărcat cu succes');

        const platform = new window.H.service.Platform({
          apikey: apiKey
        });

        const defaultLayers = platform.createDefaultLayers();

        const newMap = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            center: { lat: 44.4268, lng: 26.1025 }, // Centrat pe București
            zoom: 10,
            pixelRatio: window.devicePixelRatio || 1
          }
        );

        // Adaugă eveniment pentru redimensionare
        window.addEventListener('resize', () => newMap.getViewPort().resize());

        // Adaugă UI controls
        new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(newMap));
        window.H.ui.UI.createDefault(newMap, defaultLayers);

        setMap(newMap);

        // Inițializăm grupul pentru rute
        const group = new window.H.map.Group();
        setRouteGroup(group);
        newMap.addObject(group);

        getCurrentPosition(newMap);

      } catch (err) {
        console.error('Eroare la inițializarea hărții:', err);
        setError(`Eroare la inițializarea hărții: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Verifică dacă referința este validă înainte de a inițializa
    if (mapRef.current) {
      initializeMap();
    }

    return () => {
      if (map) {
        map.dispose();
      }
    };
  }, [apiKey]); // Rulează doar când apiKey se schimbă

  const loadHereMapsScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`;
      script.async = true;
      script.onload = () => {
        const serviceScript = document.createElement('script');
        serviceScript.src = `https://js.api.here.com/v3/3.1/mapsjs-service.js`;
        serviceScript.async = true;
        serviceScript.onload = () => {
          const eventsScript = document.createElement('script');
          eventsScript.src = `https://js.api.here.com/v3/3.1/mapsjs-mapevents.js`;
          eventsScript.async = true;
          eventsScript.onload = () => {
            const uiScript = document.createElement('script');
            uiScript.src = `https://js.api.here.com/v3/3.1/mapsjs-ui.js`;
            uiScript.async = true;
            uiScript.onload = resolve;
            uiScript.onerror = reject;
            document.head.appendChild(uiScript);
          };
          eventsScript.onerror = reject;
          document.head.appendChild(eventsScript);
        };
        serviceScript.onerror = reject;
        document.head.appendChild(serviceScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const isValidCoordinate = (coord) => {
    return coord && 
           typeof coord.lat === 'number' && 
           typeof coord.lng === 'number' &&
           !isNaN(coord.lat) && 
           !isNaN(coord.lng);
  };

  const addMarker = (map, coord, color = 'red') => {
    if (!map || !isValidCoordinate(coord)) return;

    const marker = new window.H.map.Marker(coord, {
      volatility: true,
      data: { type: 'marker' }
    });
    
    map.addObject(marker);
    return marker;
  };

  const calculateRoute = async (start, end) => {
    try {
      if (!map || !window.H || !window.H.service) {
        throw new Error('HERE Maps API not ready');
      }

      if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
        throw new Error('Invalid coordinates');
      }

      const platform = new window.H.service.Platform({ apikey: apiKey });
      const router = platform.getRoutingService();

      const params = {
        mode: 'fastest;car',
        representation: 'display',
        waypoint0: `${start.lat},${start.lng}`,
        waypoint1: `${end.lat},${end.lng}`,
        alternatives: 0,
        routeattributes: 'waypoints,summary,shape,legs',
        maneuverattributes: 'direction,action'
      };

      return new Promise((resolve, reject) => {
        router.calculateRoute(
          params,
          (result) => {
            if (result.response && result.response.route && result.response.route.length > 0) {
              resolve(result.response.route[0]);
            } else {
              reject(new Error('No route found'));
            }
          },
          (error) => {
            reject(new Error(`Routing error: ${error.message}`));
          }
        );
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      throw error;
    }
  };

  const addRouteToMap = (route) => {
    if (!map || !route || !route.shape || !routeGroup) return;

    // Șterge ruta anterioară
    routeGroup.removeAll();

    // Adaugă linia rutei
    const lineString = new window.H.geo.LineString();
    route.shape.forEach(point => {
      const [lng, lat] = point.split(',');
      lineString.pushLatLngAlt(Number(lat), Number(lng));
    });

    const routeLine = new window.H.map.Polyline(lineString, {
      style: { strokeColor: 'blue', lineWidth: 5 }
    });

    routeGroup.addObject(routeLine);

    // Adaugă markeri pentru punctele de început și sfârșit
    const startPoint = route.waypoint[0].mappedPosition;
    const endPoint = route.waypoint[1].mappedPosition;

    addMarker(map, startPoint, 'green');
    addMarker(map, endPoint, 'red');

    // Centrează harta pe rută
    map.getViewModel().setLookAtData({
      bounds: routeLine.getBoundingBox()
    });
  };

  const getCurrentPosition = (mapInstance) => {
    if (!navigator.geolocation) {
      setError('Geolocația nu este suportată de browser-ul tău');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentPos = { lat: latitude, lng: longitude };
        setPosition(currentPos);

        if (mapInstance) {
          mapInstance.setCenter(currentPos);
          mapInstance.setZoom(14);
          addMarker(mapInstance, currentPos, 'blue');

          // Exemplu: calculăm o rută de la poziția curentă la un punct fix
          try {
            const destination = { lat: 44.4268, lng: 26.1025 }; // Piața Universității
            const route = await calculateRoute(currentPos, destination);
            addRouteToMap(route);
          } catch (error) {
            console.error('Eroare la calculul traseului:', error);
          }
        }
      },
      (err) => {
        console.error('Eroare la obținerea locației:', err);
        setError(`Eroare la obținerea locației: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    getCurrentPosition(map);
    setLoading(false);
  };

  if (loading) {
    return <div className="map-container">Se încarcă harta...</div>;
  }

  if (error) {
    return (
      <div className="map-container error">
        <p>{error}</p>
        <button onClick={refreshLocation}>Reîncearcă</button>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      <div className="map-controls">
        <button onClick={refreshLocation} disabled={loading}>
          {loading ? 'Se încarcă...' : 'Actualizează locația'}
        </button>
        {position && (
          <div className="coordinates">
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HereMap;
