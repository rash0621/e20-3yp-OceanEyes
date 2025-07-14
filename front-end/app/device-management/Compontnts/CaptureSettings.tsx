import React, { useState, useEffect } from 'react';
import { domainName } from "../../components/DomainName";
import {
  Switch, FormControlLabel, TextField, Button, Typography, Box, Paper
} from '@mui/material';

interface CaptureSettingsProps {
  onStart: (startTime: Date, endTime: Date, interval: number) => void;
  onCancel: () => void;
}

const CaptureSettings: React.FC<CaptureSettingsProps> = ({ onStart, onCancel }) => {
  const [isSchedule, setIsSchedule] = useState(false);
  const [interval, setInterval] = useState(5);
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceRunning, setDeviceRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      const start = new Date();
      const end = new Date(start.getTime() + duration * 60000);
      onStart(start, end, interval);
    }
    return () => clearTimeout(timer);
  }, [countdown, duration, interval, onStart]);

  const startOceanEye = async (): Promise<void> => {
    const topic = "raspi/TestDevice1/start";
    const now = new Date();
    const startDateTime = now.toISOString().slice(0, 19);

    const message = JSON.stringify({
      instanceId: "OCE123",
      startDateTime: startDateTime,
      end_time: "",
      timeBetweenTurns: 30,
    });

    try {
      setDeviceRunning(true);
      const res: Response = await fetch(
        `${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`,
        {
          method: "POST",
        }
      );
      const result: string = await res.text();
      console.log(result);
      alert("Device start command sent");
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
      setDeviceRunning(false);
    }
  };

  const stopOceanEye = async (): Promise<void> => {
    const topic = "raspi/TestDevice1/stop";
    const message = JSON.stringify({
      instanceId: "OCE123",
    });

    try {
      setDeviceRunning(false);
      const res: Response = await fetch(
        `${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`,
        {
          method: "POST",
        }
      );
      const result: string = await res.text();
      console.log(result);
      alert("Device stop command sent");
    } catch (error) {
      console.error("Error sending stop signal", error);
      alert("Failed to send stop signal");
      setDeviceRunning(true);
    }
  };

  const handleSchedule = () => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const delay = Math.max(0, Math.floor((start.getTime() - now.getTime()) / 1000));
    setCountdown(delay);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: '32px',
        margin: '24px 0',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isSchedule}
              onChange={() => setIsSchedule(!isSchedule)}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1976d2'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1976d2'
                }
              }}
            />
          }
          label={
            <Typography sx={{ fontWeight: 500, color: '#424242' }}>
              {isSchedule ? 'Click here, if you want to start an Instance now.' : 'Click here, if you want to schedule an Instance.'}
            </Typography>
          }
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Time Between Captures (minutes)"
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2'
              }
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1976d2'
            }
          }}
        />

        {isSchedule ? (
          <>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSchedule}
                sx={{
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                Done
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={onCancel}
                sx={{
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    backgroundColor: '#ffebee'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
            {countdown !== null && (
              <Typography 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '8px',
                  color: '#1976d2',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                Countdown: {countdown} seconds
              </Typography>
            )}
          </>
        ) : (
          <>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1976d2'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startOceanEye}
                  disabled={deviceRunning}
                  sx={{
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: 600,
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
                  Start Device
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={stopOceanEye}
                  disabled={!deviceRunning}
                  sx={{
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderColor: '#f57c00',
                    color: '#f57c00',
                    '&:hover': {
                      borderColor: '#f57c00',
                      backgroundColor: '#fff8e1'
                    },
                    '&:disabled': {
                      borderColor: '#e0e0e0',
                      color: '#bdbdbd'
                    }
                  }}
                >
                  Stop Device
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={onCancel}
                  sx={{
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: '#ffebee'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default CaptureSettings;