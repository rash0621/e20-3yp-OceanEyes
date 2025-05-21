"use client";
import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";
import 'leaflet/dist/leaflet.css';
import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import styles from "./deviceManagement.module.css"; // import CSS module

const DeviceManagement = () => {
  const [deviceRunning, setDeviceRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState("battery");

  const startOceanEye = async () => {
    const data = {
      instanceId: "OCE123",
      start: true,
      timestamp: Date.now(),
    };
    try {
      setDeviceRunning(true);
      const res = await fetch(`${domainName}device/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      alert("Device start command sent");
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
      setDeviceRunning(false);
    }
  };

  const stopOceanEye = async () => {
    const data = {
      instanceId: "OCE123",
      stop: true,
      timestamp: Date.now(),
    };
    try {
      setDeviceRunning(false);
      const res = await fetch(`${domainName}device/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      alert("Device stop command sent");
    } catch (error) {
      console.error("Error sending stop signal", error);
      alert("Failed to send stop signal");
      setDeviceRunning(true);
    }
  };

  return (
    <RequireAuth>
      <div className={styles.container}>
        <img src="/assets/nav/manage.jpg" alt="OceanEyes Device" className={styles.deviceImage} />

        <div className={styles.deviceControlBox}>
          <p className={styles.title}>OceanEyes Device Control</p>
          <p className={styles.subtitle}>Use the controls below to manage the device</p>

          <img src="/assets/deviceMng/design.png" alt="OceanEyes Device" className={styles.deviceDesignImage} />
          
          <button
            onClick={startOceanEye}
            disabled={deviceRunning}
            className={styles.startButton}
          >
            Start Device
          </button>
          <button
            onClick={stopOceanEye}
            disabled={!deviceRunning}
            className={styles.stopButton}
          >
            Stop Device
          </button>
        </div>

        <div className={styles.statusBox}>
          <p className={styles.title}>OceanEyes Device Status</p>

          <div className={styles.tabButtons}>
            <button
              onClick={() => setSelectedTab("battery")}
              className={`${styles.tabButton} ${selectedTab === "battery" ? styles.tabButtonActive : styles.tabButtonInactive}`}
            >
              Battery %
            </button>
            <button
              onClick={() => setSelectedTab("location")}
              className={`${styles.tabButton} ${selectedTab === "location" ? styles.tabButtonActive : styles.tabButtonInactive}`}
            >
              Location
            </button>
          </div>

          <div className={styles.tabContent}>
            {selectedTab === "battery" && <p><strong>Battery:</strong> 76%</p>}
            {selectedTab === "location" && (
              <div>
                <p><strong>Location:</strong> Lat 6.9271, Lon 79.8612</p>
                <MapContainer
                  center={[6.9271, 79.8612]}
                  zoom={13}
                  style={{ height: "400px", width: "100%", marginTop: "16px", borderRadius: "10px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default DeviceManagement;
