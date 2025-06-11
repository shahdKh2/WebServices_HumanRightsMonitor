import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
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
    <div
      style={{
        height: '400px',
        width: '100%',
        position: 'relative',
        marginBottom: '40px',
        zIndex: 0,
      }}
    >
      <MapContainer
        center={[15.3694, 44.1910]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
