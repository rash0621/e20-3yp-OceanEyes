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
        maxHeight: '400px', 
        overflowY: 'auto',
        fontFamily: 'Poppins',
        margin: '0px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: '10px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9fafaff',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#cfe0e7ff',
          borderRadius: '8px',
        },
        '& .MuiTable-root': {
          width: '100%',
          tableLayout: 'fixed'
        },
        '& .MuiTableCell-root': {
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
          fontWeight: 400,
          color: '#37474f'
        },
        '& .MuiTableHead-root': {
          backgroundColor: '#ccd8e7ff', 
          '& .MuiTableCell-root': {
            fontWeight: 700,
            backgroundColor: '#f0f4faff',
            color: '#1e293b',
            fontFamily: 'Poppins',
            textTransform: 'uppercase',
            fontSize: '14px',
            letterSpacing: '0.5px'
          }
        },
        '& .MuiTableBody-root': {
          '& .MuiTableRow-root': {
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: '#f8fafc'
            },
            '&.selected': {
              backgroundColor: '#e3f2fd',
              '&:hover': {
                backgroundColor: '#dbefff'
              }
            }
          }
        }
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell>Device ID</TableCell>
            <TableCell>Device Name</TableCell>
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
              <TableCell sx={{ fontFamily: 'Poppins', color: '#455a64' }}>
                {device.id}
              </TableCell>
              <TableCell sx={{ fontFamily: 'Poppins', fontWeight: 500, color: '#1e293b' }}>
                {device.deviceName}
              </TableCell>
              <TableCell sx={{ fontFamily: 'Poppins', color: '#546e7a' }}>
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
