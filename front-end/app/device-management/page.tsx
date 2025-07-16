
"use client";

import React, { useState, useEffect} from "react";
import { Box, Step, StepLabel, Stepper, Switch, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel, Typography } from "@mui/material";
import styles from "./deviceManagement.module.css";
import RequireAuth from "../components/RequireAuth";
import { domainName } from "../components/DomainName";
import DeviceStatus from "./Compontnts/DeviceStatus";
import CaptureSettings from "./Compontnts/CaptureSettings";
import DeviceTable from "./Compontnts/DeviceTable";
import DeviceSearchBar from "./Compontnts/DeviceSearchBar";
import { Device } from "./types";

const steps = ["Select Device", "Configure Operation", "Status"];

const DeviceManagementPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isScheduled, setIsScheduled] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [toggleOption, setToggleOption] = useState(false); // false: Start Now, true: Schedule
  const [timeBetweenCaptures, setTimeBetweenCaptures] = useState(5);
  const [duration, setDuration] = useState(10);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({ location: "--", battery: "--" });
  
  const handleFilteredDevicesChange = (filtered: Device[]) => {
    setFilteredDevices(filtered);
  };


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
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (activeStep === 1 && toggleOption) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const delay = Math.floor((start - now) / 1000);
      setCountdown(delay > 0 ? delay : 0);
    }
    setActiveStep(prev => prev + 1);
    console.log("active step:", activeStep );
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
        <div className="pageTitle">
          {/* <h1 className={styles.pageTitle}>Device Management</h1> */}
          {/* <img src="/assets/nav/manage.jpg" alt="OceanEyes Device"
            style={{ width: "200px", display: "block", margin: "10px auto" }} />
          <p className={styles.DeviceManagementSubTitle}>
            Link your IoT device to our system to start receiving data
          </p> */}
        </div>

          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            padding: '32px 24px',
            margin: '0px 0px 20px 0px',
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
                  fontFamily: 'Poppins',
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
      <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-lg border border-slate-200 max-w-4xl mx-auto">
        
        {/* Search Bar */}
        <DeviceSearchBar 
          devices={devices}
          onFilteredDevicesChange={handleFilteredDevicesChange}
          selectedDeviceId={selectedDeviceId}
        />

        {/* Device Table - only render if there are filtered devices */}
        {filteredDevices.length > 0 && (
          <DeviceTable 
            devices={filteredDevices} 
            selectedDeviceId={selectedDeviceId} 
            onSelect={setSelectedDeviceId}
          />
        )}

        {/* Next Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!selectedDeviceId}
            sx={{
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              fontFamily: 'Poppins',
              textTransform: 'none',
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                boxShadow: 'none'
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </Box>
      )}
      
      {activeStep === 1 && selectedDeviceId && (
  <CaptureSettings
    onStart={(start, end, interval) => {
      console.log("Starting device with settings 2S:", start, end, interval);
      // Update state or trigger backend call
      // setDeviceStatus({ location: "Lat 6.9271, Lng 79.8612", battery: "76%" });
      setActiveStep(2);
    }}
    onCancel={handleCancel}
    onNext={handleNext}
  />
)}

        {activeStep === 1 && (
      <Box className={styles.configSection}>
        </Box>
      )}


        {activeStep === 2 && (
          <Box className={styles.statusBox}>
            
            <DeviceStatus 
              location="Lat 6.9271, Lon 79.8612" 
              battery={76} 
              onCancel={handleCancel}
            />
    
          </Box>
        )}
      </Box>
    </RequireAuth>
  );
};

export default DeviceManagementPage;

