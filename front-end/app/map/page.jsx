"use client";

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import RequireAuth from "../components/RequireAuth";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = () => {
  const [position, setPosition] = useState(null);

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
    <div id="OceanMap" className="mx-24 pt-2 relative z-0">
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={7}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
      <div className="mt-4 text-center">
        {position && (
          <>
            <p className="mt-2">
              Selected: Latitude {position.lat}, Longitude {position.lng}
            </p>
            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Save Location
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default function ViewMap() {
  return (
    <RequireAuth>
      <div className="p-6 text-2xl font-bold text-center">Map</div>
      <LocationPicker />
    </RequireAuth>
  );
}
