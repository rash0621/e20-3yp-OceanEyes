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
  const [instances, setInstances] = useState([]); //As of now instances, later change this to an instance

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await axios.get(`${domainName}instance/allInstances`);
        console.log("Fetched instances:", response.data); // DEBUG: show fetched data
        setInstances(response.data); // assuming array of instances with gpsLocation
      } catch (err) {
        console.error('Failed to fetch instances', err);
      }
    };
    fetchInstances();
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
        {instances.map((instance, index) => (
          <Marker
            key={index}
            // position={[
            //   instance.gpsLocation.lat,
            //   instance.gpsLocation.lng
            // ]}
            position={(() => {
              const [lat, lng] = instance.startGpsLocation.split(" ").map(Number);
            return [lat, lng];
            })()}
          >
            <Popup>
              <div>
                <h3 className="font-bold">instance Details</h3>
                <p><strong>ID:</strong> {instance._id}</p>
                <p><strong>Device Name:</strong> {instance.deviceName}</p>
                <p><strong>Description:</strong> {instance.description}</p>
                <p><strong>Operator:</strong> {instance.operator}</p>
                <p><strong>District:</strong> {instance.locationDistrict}</p>
                <p><strong>Distance Between Points:</strong> {instance.distanceBetweenPoints} m</p>
                <p><strong>Map ID:</strong> {instance.map}</p>
                <p><strong>Timestamp:</strong> {new Date(instance.localDateTime).toLocaleString()}</p>

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
