"use client";

import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";

const DeviceManagement=() => {

  const startOceanEye = async () => {
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
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
    }
  };

  
    return (
      
      <RequireAuth>
      <div className="p-6 text-2xl font-bold">
        Device Management Page
      </div>
      <div style={{ padding: "20px" }}>
      <h2>OceanEyes Device Control</h2>
      <button onClick={startOceanEye} 
      className='text-15px ml-4 mt-2 text-blue transition duration-150 ease-in-out hover:text-white hover:bg-blue font-medium py-5 px-16 border border-lightgrey leafbutton'
      >
        Start Device
      </button>
      </div>
      </RequireAuth>


    );
    
  }
  
  export default DeviceManagement;