// app/device-management/components/DeviceStatus.tsx

import React from 'react';
import { Typography } from '@mui/material';

interface DeviceStatusProps {
  location: string;
  battery: number;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ location, battery }) => {
  return (
    <div>
      <Typography variant="h6">Device Status</Typography>
      <Typography>Location: {location}</Typography>
      <Typography>Battery: {battery}%</Typography>
    </div>
  );
};

export default DeviceStatus;
