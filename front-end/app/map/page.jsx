"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
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

// Create a component to handle map recentering
const RecenterMap = ({ center, selectedTurn }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedTurn) {
      map.setView([7.8731, 80.7718], map.getZoom());
    } else {
      map.setView(center, map.getZoom());
    }
  }, [selectedTurn, center, map]);

  return null;
};


const Map = () => {
  const [turns, setTurns] = useState([]); //As of now Turns, later change this to an turn
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [turnImages, setTurnImages] = useState([]);
  const defaultCenter = [7.8731, 80.7718];

  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const response = await axios.get(`${domainName}turn/allTurns`);
        console.log("Fetched Turns:", response.data); // DEBUG: show fetched data
        setTurns(response.data); // assuming array of Turns with gpsLocation
      } catch (err) {
        console.error('Failed to fetch Turns', err);
      }
    };
    fetchTurns();
    const interval = setInterval(fetchTurns, 10000); // fetch every 10 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

   // Fetch images when selectedTurn changes
  useEffect(() => {
    const fetchImages = async () => {
      if (!selectedTurn) return;
      console.log("Fetching images for turnId:", selectedTurn.turnId);

      if (!selectedTurn) return;

      try {
        const response = await axios.get(`${domainName}capture/images/turn/${selectedTurn.id}`);
        console.log("Image Fetch Response:", response.data);
        if (response.data.status === "SUCCESS") {
          const imageByteArrays = response.data.data;
          const base64Images = imageByteArrays.map((base64String) =>
            `data:image/jpeg;base64,${base64String}`
          );
          setTurnImages(base64Images);
        } else {
          setTurnImages([]);
        }
      } catch (err) {
        console.error("Failed to fetch images for selected turn", err);
        setTurnImages([]);
      }
    };

    fetchImages();
  }, [selectedTurn]);
  
  return (
    <div id="OceanMap" className="mx-24 pt-2 relative z-0">
      <div className="flex gap-4">
      {/* Map container - Left half */}
      <div className={`${selectedTurn ? 'w-1/2' : 'w-full'}`}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ height: '80vh', width: '100%' }}
      >
        <RecenterMap center={defaultCenter} selectedTurn={selectedTurn} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Show capture markers */}
        {turns.map((turn, index) => (
          <Marker
            key={index}
            position={
              (turn.gpsLocationLatitude == 0 && turn.gpsLocationLongitude == 0)
                ? [7.254657057824213, 80.591233976167]
                : [turn.gpsLocationLatitude, turn.gpsLocationLongitude]
            }
            eventHandlers={{
              click: () => {
                console.log("Marker clicked:", turn);
                setSelectedTurn(turn);
              }
            }}
          >
            {/* <Popup>
              <div>
                <h3 className="font-bold">Turn Details</h3>
                <p><strong>Instance ID:</strong> {turn.instanceId}</p>
                <p><strong>Date:</strong> {turn.date}</p>
                <p><strong>Time:</strong> {turn.time}</p>
                <p><strong>Longitude:</strong> {turn.gpsLocationLongitude}</p>
                <p><strong>Latitude:</strong> {turn.gpsLocationLatitude}</p>
              </div>
            </Popup> */}
          </Marker>
        ))}
      </MapContainer>
      </div>

      {/* Details Panel - Right half */}
      {selectedTurn && (
        <div className="w-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 overflow-y-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Turn Details</h2>
            <button onClick={() => {
                  setSelectedTurn(null);
                  setTurnImages([]);
                }} 
                className="text-red-500 font-bold text-lg">
              ✕
            </button>
          </div>
          <div className="space-y-1 text-sm">
                <p><strong>Instance ID:</strong> {selectedTurn.instanceId}</p>
                <p><strong>Date:</strong> {selectedTurn.date}</p>
                <p><strong>Time:</strong> {selectedTurn.time}</p>
                {/* <p><strong>Longitude:</strong> {selectedTurn.gpsLocationLongitude}</p>
                <p><strong>Latitude:</strong> {selectedTurn.gpsLocationLatitude}</p> */}
                <p>
                    <strong>Longitude:</strong> {selectedTurn.gpsLocationLongitude == 0 ? 7.254657057824213 : selectedTurn.gpsLocationLongitude}
                </p>
                <p>
                  <strong>Latitude:</strong> {selectedTurn.gpsLocationLatitude == 0 ? 80.591233976167 : selectedTurn.gpsLocationLatitude}
                </p>
          </div>
          
        {/* Images from backend */}
            {turnImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {turnImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Turn image ${i}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
            {turnImages.length === 0 && (
              <p className="mt-4 text-gray-500 text-sm">No images available for this turn.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ViewMap() {
  return (
    <RequireAuth>
      <div className="pageTitle">
              <h5>Map</h5>
        </div>
      <Map />
    </RequireAuth>
  );
}
