"use client";

import React, { useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { domainName } from "../components/DomainName";
import dynamic from "next/dynamic";
import axios from "axios";

// Dynamically import react-leaflet components to disable SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const RequireAuth = dynamic(() => import("../components/RequireAuth"), { ssr: false });
const RecenterMap = dynamic(() => import("./RecenterMap"), { ssr: false });

const Map = () => {
  const [turns, setTurns] = useState([]);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [turnImages, setTurnImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const defaultCenter = useMemo(() => [7.8731, 80.7718], []);

  // Setup Leaflet default icons once on mount
  useEffect(() => {
    import("leaflet").then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  // Fetch turns data on mount
  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const response = await axios.get(`${domainName}turn/allTurns`);
        setTurns(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTurns();
  }, []);

  // Fetch images when a turn is selected
  useEffect(() => {
    const fetchImages = async () => {
      if (!selectedTurn) return;

      const cached = typeof window !== "undefined" ? localStorage.getItem(`turnImages_${selectedTurn.id}`) : null;
      if (cached) {
        setTurnImages(JSON.parse(cached));
        return;
      }
      try {
        const response = await axios.get(`${domainName}capture/images/turn/${selectedTurn.id}`);
        if (response.data.status === "SUCCESS") {
          const imageUrls = response.data.data;
          setTurnImages(imageUrls);
          if (typeof window !== "undefined") {
            localStorage.setItem(`turnImages_${selectedTurn.id}`, JSON.stringify(imageUrls));
          }
        } else {
          setTurnImages([]);
        }
      } catch (err) {
        setTurnImages([]);
      }
    };

    fetchImages();
  }, [selectedTurn]);

  return (
    <RequireAuth>
      <img
        src="/assets/nav/viewMap.jpg"
        alt="OceanEyes Device"
        style={{ width: "140px", display: "block", margin: "10px auto" }}
      />
      <div id="OceanMap" className="mx-24 pt-2 mb-10 relative z-0">
        <div className="flex gap-4">
          <div className={`${selectedTurn ? "w-1/2" : "w-full"}`}>
            {/* Use a stable key here to force remount when selectedTurn changes */}
            <MapContainer
              key={selectedTurn ? `turn-${selectedTurn.id}` : "default"}
              center={defaultCenter}
              zoom={selectedTurn ? 9 : 7}
              style={{ height: "80vh", width: "100%" }}
            >
              {leafletReady && (
                <RecenterMap
                  center={
                    selectedTurn
                      ? [selectedTurn.gpsLocationLatitude, selectedTurn.gpsLocationLongitude]
                      : defaultCenter
                  }
                  zoom={selectedTurn ? 9 : 7}
                />
              )}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {turns.map((turn, index) => (
                <Marker
                  key={index}
                  position={
                    turn.gpsLocationLatitude === 0 && turn.gpsLocationLongitude === 0
                      ? [7.254657057824213, 80.591233976167]
                      : [turn.gpsLocationLatitude, turn.gpsLocationLongitude]
                  }
                  eventHandlers={{
                    click: () => setSelectedTurn(turn),
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {selectedTurn && (
            <div className="w-1/2 bg-white shadow-2xl rounded-2xl p-6 border border-gray-300 overflow-y-auto max-h-[80vh] transition-all">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <img
                    src="/assets/icons/map.png"
                    alt="Map Marker Icon"
                    className="mr-2 w-12 h-12"
                  />
                  Turn Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedTurn(null);
                    setTurnImages([]);
                  }}
                  className="text-red-500 font-bold text-lg"
                  aria-label="Close turn details"
                >
                  <img
                    src="/assets/icons/close.png"
                    alt="Close Icon"
                    className="w-5 h-5"
                  />
                </button>
              </div>

              {/* Table for Turn Details */}
              <table className="w-full text-left text-gray-700 text-sm">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium flex items-center">
                      <img
                        src="/assets/icons/id.png"
                        alt="ID Badge Icon"
                        className="mr-2 w-5 h-5"
                      />
                      Instance ID
                    </td>
                    <td className="py-2">{selectedTurn.instanceId}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium flex items-center">
                      <img
                        src="/assets/icons/calendar.png"
                        alt="Calendar Icon"
                        className="mr-2 w-5 h-5"
                      />
                      Date
                    </td>
                    <td className="py-2">{selectedTurn.date}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium flex items-center">
                      <img
                        src="/assets/icons/clock.png"
                        alt="Clock Icon"
                        className="mr-2 w-5 h-5"
                      />
                      Time
                    </td>
                    <td className="py-2">{selectedTurn.time}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium flex items-center">
                      <img
                        src="/assets/icons/equator.png"
                        alt="Longitude Icon"
                        className="mr-2 w-5 h-5"
                      />
                      Longitude
                    </td>
                    <td className="py-2">
                      {selectedTurn.gpsLocationLongitude === 0
                        ? 7.254657057824213
                        : selectedTurn.gpsLocationLongitude}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="py-2 font-medium flex items-center">
                      <img
                        src="/assets/icons/earth.png"
                        alt="Latitude Icon"
                        className="mr-2 w-5 h-5"
                      />
                      Latitude
                    </td>
                    <td className="py-2">
                      {selectedTurn.gpsLocationLatitude === 0
                        ? 80.591233976167
                        : selectedTurn.gpsLocationLatitude}
                    </td>
                  </tr>
                </tbody>
              </table>

              {turnImages.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {turnImages.map((url, idx) => (
                    <img
                      key={idx}
                      src={`${domainName}${url}`}
                      alt={`Turn ${idx}`}
                      className="cursor-pointer rounded shadow hover:scale-105 transition-transform duration-200"
                      onClick={() => setSelectedImage(`${domainName}${url}`)}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedImage(`${domainName}${url}`);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-500 text-sm flex items-center">
                  <img
                    src="/assets/icons/no-pictures.png"
                    alt="No Images Icon"
                    className="mr-2 w-5 h-5"
                  />
                  No images available for this turn.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Image Popup Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto relative mb-10"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged"
                className="w-full h-auto rounded-lg mb-4"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Close image popup"
              >
                <img
                  src="/assets/icons/close.png"
                  alt="Close Icon"
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
};

export default Map;
