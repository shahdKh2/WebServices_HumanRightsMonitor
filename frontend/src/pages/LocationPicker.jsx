import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ setCoordinates }) => {
  const handleClick = (e) => {
    setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
  };

  const MapEvents = () => {
    useMapEvents({ click: handleClick });
    return null;
  };

  return (
    <MapContainer 
      center={[15.3694, 44.1910]}  // Default to Sana'a, Yemen
      zoom={6} 
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEvents />
    </MapContainer>
  );
};

export default LocationPicker;