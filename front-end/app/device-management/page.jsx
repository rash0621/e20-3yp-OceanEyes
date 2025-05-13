"use client";
import { useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";

const DeviceManagement=() => {

  const [deviceRunning, setDeviceRunning] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);

  const startOceanEye = async () => {
    setLoadingStart(true);
    const data = {
      instanceId: "OCE123", // example instance
      start: true,
      timestamp: Date.now(),
    };
    try {
      const res = await fetch(`${domainName}device/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      setDeviceRunning(true);
      alert("Device started successfully");
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
    }finally {
      setLoadingStart(false);
    };
  }
  
   const stopOceanEye = async () => {
    setLoadingStop(true);
    const data = {
      instanceId: "OCE123",
      stop: true,
      timestamp: Date.now(),
    };
    try {
      const res = await fetch(`${domainName}device/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.text();
      console.log(result);
      setDeviceRunning(false);
      alert("Device stopped successfully");
    } catch (error) {
      console.error("Error sending stop signal", error);
      alert("Failed to send stop signal");
    } finally {
      setLoadingStop(false);
    }
  };

  
    return (
      
      <RequireAuth>
      <div className="p-6 text-2xl font-bold">
        Device Management Page
      </div>
      <div style={{ padding: "20px" }}>
      <h2>OceanEyes Device Control</h2>
      <button
          onClick={startOceanEye}
          disabled={deviceRunning || loadingStart}
          className={`text-15px ml-4 mt-2 transition duration-150 ease-in-out font-medium py-5 px-16 border border-lightgrey leafbutton ${
            deviceRunning || loadingStart
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "text-blue hover:text-white hover:bg-blue"
          }`}
      >{loadingStart ? "Starting..." : "Start Device"}
      </button>
       <button
          onClick={stopOceanEye}
          disabled={!deviceRunning || loadingStop}
          className={`text-15px ml-4 mt-2 transition duration-150 ease-in-out font-medium py-5 px-16 border border-lightgrey leafbutton ${
            !deviceRunning || loadingStop
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "text-red-600 hover:text-white hover:bg-red-600"
          }`}
        >
          {loadingStop ? "Stopping..." : "Stop Device"}
        </button>
      </div>
      </RequireAuth>


    );
    
  }
  
  export default DeviceManagement;