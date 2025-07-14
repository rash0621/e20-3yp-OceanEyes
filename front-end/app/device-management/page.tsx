
"use client";

import React, { useState, useEffect} from "react";
import { Box, Step, StepLabel, Stepper, Switch, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel, Typography } from "@mui/material";
import styles from "./deviceManagement.module.css";
import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";
import DeviceStatus from "./Compontnts/DeviceStatus";
import CaptureSettings from "./Compontnts/CaptureSettings";
import DeviceTable from "./Compontnts/DeviceTable";
import { Device } from "./types";

const steps = ["Select Device", "Configure Operation", "Status"];

const DeviceManagementPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [toggleOption, setToggleOption] = useState(false); // false: Start Now, true: Schedule
  const [timeBetweenCaptures, setTimeBetweenCaptures] = useState(5);
  const [duration, setDuration] = useState(10);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({ location: "--", battery: "--" });

  useEffect(() => {
    fetch(`${domainName}device/getAll`) 
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleNext = () => {
    if (activeStep === 1 && toggleOption) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const delay = Math.floor((start - now) / 1000);
      setCountdown(delay > 0 ? delay : 0);
    }
    setActiveStep(prev => prev + 1);
  };

  const handleCancel = () => {
    setActiveStep(0);
    setSelectedDeviceId(null);
    setCountdown(null);
  };

  const handleStartDevice = () => {
    // Fetch location/battery status here too
    setDeviceStatus({ location: "Lat 6.9271, Lng 79.8612", battery: "76%" });
    setActiveStep(2);
  };

  return (
    <RequireAuth>
      <Box className={styles.container}>
        <h2>Device Management</h2>

          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            padding: '32px 24px',
            margin: '24px 0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            width: '100%',
            boxSizing: 'border-box'
          }}>
          <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                width: '100%',
                padding: '0',
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-label': {
                  fontSize: '14px',
                  fontWeight: 500,
                  marginTop: '8px',
                  color: '#666',
                  '&.Mui-active': {
                    color: '#1976d2',
                    fontWeight: 600
                  },
                  '&.Mui-completed': {
                    color: '#2e7d32',
                    fontWeight: 500
                  }
                }
              },
              '& .MuiStepIcon-root': {
                fontSize: '28px',
                color: '#e0e0e0',
                '&.Mui-active': {
                  color: '#1976d2',
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s ease'
                },
                '&.Mui-completed': {
                  color: '#2e7d32'
                }
              },
              '& .MuiStepIcon-text': {
                fontSize: '14px',
                fontWeight: 600,
                fill: '#fff'
              },
              '& .MuiStepConnector-root': {
                top: '14px',
                '& .MuiStepConnector-line': {
                  height: '3px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
                  transition: 'background-color 0.3s ease'
                }
              },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                backgroundColor: '#1976d2'
              },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                backgroundColor: '#2e7d32'
              },
              '& .MuiStep-root': {
                padding: '0 8px'
              }
                }}
            >
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
          </Stepper>
        </div>

        {activeStep === 0 && (
        <Box className={styles.selectionSection}>
          <DeviceTable devices={devices} selectedDeviceId={selectedDeviceId} onSelect={setSelectedDeviceId}/>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedDeviceId}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
        </Box>
      )}
      
      {activeStep === 1 && selectedDeviceId && (
  <CaptureSettings
    onStart={(start, end, interval) => {
      console.log("Starting device with settings:", start, end, interval);
      // Update state or trigger backend call
      // setDeviceStatus({ location: "Lat 6.9271, Lng 79.8612", battery: "76%" });
      setActiveStep(2);
    }}
    onCancel={handleCancel}
  />
)}

        {activeStep === 1 && (
      <Box className={styles.configSection}>
        </Box>
      )}


        {activeStep === 2 && (
          <Box className={styles.statusBox}>
            <Typography variant="h6">Selected Device</Typography>
            <DeviceStatus 
              location="Lat 6.9271, Lon 79.8612" 
              battery={76} 
            />
            {countdown !== null && countdown > 0 ? (
              <>
                <p>Countdown: {countdown} seconds</p>
                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
              </>
            ) : (
              <>
                <p><strong>Location:</strong> {deviceStatus.location}</p>
                <p><strong>Battery:</strong> {deviceStatus.battery}</p>
              </>
            )}
          </Box>
        )}
      </Box>
    </RequireAuth>
  );
};

export default DeviceManagementPage;

