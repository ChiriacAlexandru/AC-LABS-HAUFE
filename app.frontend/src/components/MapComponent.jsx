import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const MapComponent = () => {
  const center = { lat: 44.4268, lng: 26.1025 }; // ex: București

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      language="ro"
      libraries={['places']}
    >
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ height: '500px', width: '100%' }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
