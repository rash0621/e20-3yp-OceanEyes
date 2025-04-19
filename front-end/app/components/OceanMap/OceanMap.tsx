import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = () => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position === null ? null : <Marker position={position} />;
  };

  const handleSave = async () => {
    if (position) {
      try {
        await axios.post('http://localhost:8080/api/location', position);
        alert('Location saved successfully!');
      } catch (err) {
        alert('Error saving location');
        console.error(err);
      }
    }
  };

  return (
    <div id="OceanMap" className="mx-24 pt-24 relative z-0"> {/* Horizontal margin */}
      <h3 className="text-4xl lg:text-5xl pt-4 font-semibold sm:leading-tight mt-5 text-center mb-6">Ocean Garbage Map</h3>
      <MapContainer
        center={[7.8731, 80.7718]} // Centered around Sri Lanka
        zoom={7}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
      <div className="mt-4">
        {position && (
          <p className="mt-2">
            Selected: Latitude {position.lat}, Longitude {position.lng}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;