"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";

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

const Map = () => {
  const [position, setPosition] = useState(null);
  const [turns, setTurns] = useState([]); //As of now Turns, later change this to an turn

  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const response = await axios.get(`${domainName}turns/allTurns`);
        console.log("Fetched Turns:", response.data); // DEBUG: show fetched data
        setTurns(response.data); // assuming array of Turns with gpsLocation
      } catch (err) {
        console.error('Failed to fetch Turns', err);
      }
    };
    fetchTurns();
  }, []);

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
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <LocationMarker />
        {/* Show capture markers */}
        {turns.map((turn, index) => (
          <Marker
            key={index}
            position={[
              turn.gpsLocationLatitude,
              turn.gpsLocationLongitude
            ]}
            // position={(() => {
            //   const [lat, lng] = turn.startGpsLocation.split(" ").map(Number);
            // return [lat, lng];
            // })()}
          >
            <Popup>
              <div>
                <h3 className="font-bold">Turn Details</h3>
                <p><strong>ID:</strong> {turn._id}</p>
                {/* <p><strong>Device Name:</strong> {turn.deviceName}</p>
                <p><strong>Description:</strong> {turn.description}</p>
                <p><strong>Operator:</strong> {turn.operator}</p>
                <p><strong>District:</strong> {turn.locationDistrict}</p>
                <p><strong>Distance Between Points:</strong> {turn.distanceBetweenPoints} m</p>
                <p><strong>Map ID:</strong> {turn.map}</p>
                <p><strong>Timestamp:</strong> {new Date(turn.localDateTime).toLocaleString()}</p> */}

              </div>
            </Popup>
          </Marker>
        ))}

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
      <Map />
    </RequireAuth>
  );
}
