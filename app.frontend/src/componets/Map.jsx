import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

function Map() {
  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGFnZXN0dWRpbyIsImEiOiJjbTlrM3o5eXUwaWVjMmtzZ3ltcDAwazR6In0.tLphe6RSpLB4jbjdYuBg4g'

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/tagestudio/cm9zudu7q006201s3fzgwafy6', // Stilul personalizat
      center: [21.230, 45.750], // Centrul hărții
      zoom: 10, // Zoom-ul inițial
    })

    // Ascunde sigla și controlul de atribuire
    mapRef.current.on('load', () => {
      // Ascunde sigla Mapbox
      const logo = document.querySelector('.mapboxgl-ctrl-logo');
      if (logo) {
        logo.style.display = 'none';
      }
      
      // Ascunde controlul de atribuire
      const attrib = document.querySelector('.mapboxgl-ctrl-attrib-inner');
      if (attrib) {
        attrib.style.display = 'none';
      }
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <div
      ref={mapContainerRef}
      className="w-screen h-screen" // Full screen
    />
  )
}

export default Map
