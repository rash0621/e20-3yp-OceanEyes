// app/device-management/components/DeviceTable.tsx

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Checkbox
} from '@mui/material';
import { Device } from "../types";

interface DeviceTableProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelect: (deviceId: string) => void;
}


const DeviceTable: React.FC<DeviceTableProps> = ({ devices, selectedDeviceId, onSelect }) => {
  return (
    <TableContainer 
  component={Paper}
  sx={{ 
    width: '100%', 
    margin: '25px auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    '& .MuiTable-root': {
      width: '100%',
      tableLayout: 'fixed'
    },
    '& .MuiTableCell-root': {
      padding: '16px 24px',
      borderBottom: '1px solid #e0e0e0',
      fontSize: '14px',
      fontWeight: 400
    },
    '& .MuiTableHead-root': {
      backgroundColor: '#fafafa',
      '& .MuiTableCell-root': {
        fontWeight: 600,
        color: '#424242',
        textTransform: 'uppercase',
        fontSize: '12px',
        letterSpacing: '0.5px'
      }
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: '#f8f9fa'
        },
        '&.selected': {
          backgroundColor: '#e3f2fd',
          '&:hover': {
            backgroundColor: '#e1f5fe'
          }
        }
      }
    }
  }}>
      <Table>
    <TableHead>
      <TableRow>
        <TableCell>Select</TableCell>
        <TableCell>Device ID</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Last Location</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {devices.map((device) => (
        <TableRow 
          key={device.id}
          className={selectedDeviceId === device.id ? 'selected' : ''}
          onClick={() => onSelect(device.id)}
        >
          <TableCell>
            <Checkbox
              checked={selectedDeviceId === device.id}
              onChange={() => onSelect(device.id)}
              inputProps={{ 'aria-label': `select device ${device.id}` }}
              sx={{
                color: '#1976d2',
                '&.Mui-checked': {
                  color: '#1976d2'
                }
              }}
            />
          </TableCell>
          <TableCell sx={{ fontFamily: 'Poppins', color: '#555' }}>
            {device.id}
          </TableCell>
          <TableCell sx={{ fontWeight: 500, color: '#212121' }}>
            {device.name}
          </TableCell>
          <TableCell sx={{ color: '#666' }}>
            {device.lastLocation}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
  );
};

export default DeviceTable;
