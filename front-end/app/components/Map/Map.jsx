"use client";

import React, { useEffect, useState } from "react";

const Clientsay = ({ instanceId }) => {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8081/api/v1/instance/67c2a009591b51058fc1e742`)
      .then((response) => response.json())
      .then((data) => setInstance(data))
      .catch((error) => console.error("Error fetching instance details:", error));
  }, [instanceId]);

  if (!instance) {
    return <div>Loading instance details...</div>;
  }

  return (
    <div>
      <h1>Instance Details</h1>
      <p>Instance ID: {instance.instanceId}</p>
      <p>Device Name: {instance.deviceName}</p>
      {/* Add other details here */}
    </div>
  );
};

export default Clientsay;
