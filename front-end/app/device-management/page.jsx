"use client";
import { domainName } from "../components/DomainName";

import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from "next/dynamic";
// import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
// If you're using useMap, wrap it in useEffect or move logic into a component dynamically imported the same way
const RequireAuth = dynamic(() => import('../components/RequireAuth'), {
  ssr: false,
});
const DeviceManagement = () => {
  const [deviceRunning, setDeviceRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState("battery"); // battery or location
  const [deviceLocation, setDeviceLocation] = useState({ lat: 6.9271, lng: 79.8612 });

  const startOceanEye = async () => {
    const topic = "raspi/TestDevice1/start";
    const message = JSON.stringify({
      instanceId: "OCE123",
      startDateTime: Date.now(),
      end_time: "",
      timeBetweenTurns: 30,
});
    try {
      // Set device to running immediately
      setDeviceRunning(true);
      const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      alert("Device start command sent");
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
      setDeviceRunning(false); // Revert if failed
    }
  };

  const stopOceanEye = async () => {
     const topic = "raspi/TestDevice1/stop";
      const message = JSON.stringify({
      instanceId: "OCE123",
});
    try {
      // Set device to not running immediately
      setDeviceRunning(false);
      const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      alert("Device stop command sent");
    } catch (error) {
      console.error("Error sending stop signal", error);
      alert("Failed to send stop signal");
      setDeviceRunning(true); // Revert if failed
    }
  };

  const getTabStyle = (isActive) => ({
    backgroundColor: isActive ? "#2563eb" : "#d1d5db",
    color: isActive ? "#ffffff" : "#111827",
    padding: "10px 50px",
    borderRadius: "0px 30px 30px 40px",
    cursor: "pointer",
    fontWeight: "500",
    padding: "20px 64px",
    fontSize: "15px",
    marginLeft: "16px",
    marginTop: "0px",
  });

  return (
    <RequireAuth>
      <div style={{
        height: "auto",
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
      }}>
        {/* <div className="pageTitle">
          <h5>Device Management</h5>
        </div> */}
      <img 
        src="/assets/nav/manage.jpg" 
        alt="OceanEyes Device"
        style={{ width: "220px", display: "block", margin: "10px auto"}}
      />

        {/* Device Control Details */}
        <div
          style={{
            width: "80%",
            padding: "30px",
            marginBottom: "10px",
            textAlign: "center",
            display: "inline-block",
            backgroundImage: 'url("/assets/deviceMng/bg.jpg")', 
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <p
          className="pageSubTitle"
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
          >
            OceanEyes Device Control
          </p>

          <p
          className="pageSubTitle"
          style={{
            fontSize: "15px",
            fontWeight: "400",
            marginBottom: "16px",
          }} >
            Use the controls below to manage the device
        </p>

          <img 
            src="/assets/deviceMng/design.png" 
            alt="OceanEyes Device"
            style={{ width: "150px", display: "block", margin: "10px auto"}}
          />
          <button
            onClick={startOceanEye}
            disabled={deviceRunning}
            // className={`text-15px ml-4 mt-2 transition duration-150 ease-in-out font-medium py-5 px-16 border border-lightgrey leafbutton ${
            //   deviceRunning
            //     ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            //     : "text-blue hover:text-white hover:bg-blue"
            // }`}
            style={{
              backgroundColor: deviceRunning ? "#d1d5db" : "#16a34a", // gray if disabled, green if active
              color: deviceRunning ? "#4b5563" : "#ffffff",           // gray text if disabled, white if active
              cursor: deviceRunning ? "not-allowed" : "pointer",
              padding: "20px 64px",
              fontSize: "15px",
              marginLeft: "16px",
              marginTop: "8px",
              fontWeight: "500",
              transition: "background-color 0.15s ease-in-out",
              borderRadius: "0px 30px 30px 40px"
            }}
          >
            Start Device
          </button>
          <button
            onClick={stopOceanEye}
            disabled={!deviceRunning}
            // className={`text-15px ml-4 mt-2 transition duration-150 ease-in-out font-medium py-5 px-16 border border-lightgrey leafbutton ${
            //   !deviceRunning
            //     ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            //     : "text-red-600 hover:text-white hover:bg-red-600"
            // }`}
            style={{
              backgroundColor: !deviceRunning ? "#d1d5db" : "#dc2626", // gray if disabled, red if active
              color: !deviceRunning ? "#4b5563" : "#ffffff",           // gray text if disabled, white if active
              cursor: !deviceRunning ? "not-allowed" : "pointer",
              padding: "20px 64px",
              fontSize: "15px",
              marginLeft: "16px",
              marginTop: "8px",
              fontWeight: "500",
              transition: "background-color 0.15s ease-in-out",
              borderRadius: "0px 30px 30px 40px",
            }}
          >
            Stop Device
          </button>
        </div>


        {/* Device Setting Details */}
        <div
          style={{
            width: "80%",
            padding: "30px",
            marginTop: "10px",
            marginBottom: "30px",
            textAlign: "center",
            display: "flex", 
            justifyContent: "center",
            backgroundImage: 'url("/assets/deviceMng/bg2.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center"
          }}
        >
        <p
          className="pageSubTitle"
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
          }} >
            OceanEyes Device Status
        </p>

        {/* Sub-Tab Buttons */}
        <div style={{ marginTop: "20px", display: "flex", gap: "20px", padding: "20px"}}>
          <button onClick={() => setSelectedTab("battery")} style={getTabStyle(selectedTab === "battery")}>
            Battery %
          </button>
          <button onClick={() => setSelectedTab("location")} style={getTabStyle(selectedTab === "location")}>
            Location
          </button>
          {/* <button onClick={() => setSelectedTab("timeLeft")} style={getTabStyle(selectedTab === "timeLeft")}>
            Time Left
          </button> */}
        </div>

        {/* Sub-Tab Content */}
        <div style={{
          marginTop: "16px",
          padding: "20px",
          width: "100%",
          textAlign: "center",
        }}>
          {selectedTab === "battery" && <p><strong>Battery:</strong> 76%</p>}

          {selectedTab === "location" && (
          <div>
          <p><strong>Location:</strong> Lat 6.9271, Lon 79.8612</p>
          <MapContainer
          center={[6.9271, 79.8612]}
          zoom={13}
          className="relative z-0"
          style={{
            height: "400px",
            width: "100%",
            marginTop: "16px",
            borderRadius: "10px",
          }}
          >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          </MapContainer>
          </div>
        )}
        {/* {selectedTab === "timeLeft" && <p><strong>Estimated Time Left:</strong> 3 hours 20 minutes</p>} */}
        </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default DeviceManagement;
