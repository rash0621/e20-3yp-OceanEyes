import React, { useState, useEffect } from 'react';
import { domainName } from "../../components/DomainName";
import DeviceStatus from "./DeviceStatus";
import { 
  Play, 
  Calendar, 
  Square, 
  X,
  Timer,
  Clock,
  Camera,
  ArrowLeft
} from 'lucide-react';

interface CaptureSettingsProps {
  onStart: (startTime: Date, endTime: Date, interval: number) => void;
  onCancel: () => void;
  onNext: () => void;
}

const CaptureSettings: React.FC<CaptureSettingsProps> = ({ onStart, onCancel, onNext }) => {
  const [selectedMode, setSelectedMode] = useState<'immediate' | 'scheduled' | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [interval, setInterval] = useState(5);
  const [duration, setDuration] = useState(0.5);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceRunning, setDeviceRunning] = useState(false);
  const getCurrentLocalDatetime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:mm
};

  const startOceanEye = async () => {
      const topic = "raspi/TestDevice1/start";
      const now = new Date(Date.now());
      const startDateTime = now.toISOString().slice(0, 19);
      const message = JSON.stringify({
        instanceId: "OCE123",
        startDateTime: startDateTime ,
        end_time: "",
        timeBetweenTurns: 30,
  });
      try {
        // Set device to running immediately
        setDeviceRunning(true);
        const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
          method: "POST"
  //        headers: {
  //          "Content-Type": "application/json",
  //        },
  //        body: JSON.stringify(data),
        });
        const result = await res.text();
        console.log(result);
        onNext(); // Proceed to next step after starting the device
        alert("Device start command sent");
      } catch (error) {
        console.error("Error sending start signal", error);
        alert("Failed to send start signal");
        setDeviceRunning(false); // Revert if failed
      }
    };


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScheduled && countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isScheduled && countdown === 0) {
      const start = new Date();
      const end = new Date(start.getTime() + duration * 60000);
      setCountdown(null);
      startOceanEye();   
      setIsScheduled(false); 
    }
    return () => clearTimeout(timer);
  }, [countdown, duration, interval,isScheduled, onStart]);

  const handleSchedule = () => {
    if (!startTime || !endTime) {
      alert("Please select both start and end times");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      alert("Start time must be in the future");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const delay = Math.max(0, Math.floor((start.getTime() - now.getTime()) / 1000));
    setCountdown(delay);
    setIsScheduled(true);
  };

  const resetToSelection = () => {
    setSelectedMode(null);
    setCountdown(null);
    setDeviceRunning(false);
  };

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-lg border border-slate-200 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          OceanEyes Capture Settings
        </h2>
        <p className="text-slate-600">
          Configure your capture session
        </p>
      </div>
      <button
        onClick={onCancel}
        className="inline-flex items-center px-3 py-1 text-sm transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#1e293b'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Device Selection
      </button>

      {!selectedMode && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded-lg border cursor-pointer transform transition-all duration-300 hover:scale-105 group"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderColor: '#e2e8f0'
            }}
            onClick={() => setSelectedMode('immediate')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <Play className="w-8 h-8" style={{ color: '#2563eb' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1e293b' }}>
                Start Instance Now
              </h3>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Begin capturing immediately with custom duration and interval settings
              </p>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg border cursor-pointer transform transition-all duration-300 hover:scale-105 group"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderColor: '#e2e8f0'
            }}
            onClick={() => setSelectedMode('scheduled')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors"
                style={{ backgroundColor: '#faf5ff' }}
              >
                <Calendar className="w-8 h-8" style={{ color: '#9333ea' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1e293b' }}>
                Schedule Instance
              </h3>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Set specific start and end times for automated capture sessions
              </p>
            </div>
          </div>
        </div>
        
      )}

      {selectedMode && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: selectedMode === 'immediate' ? '#dbeafe' : '#faf5ff',
                  color: selectedMode === 'immediate' ? '#1e40af' : '#7c3aed'
                }}
              >
                {selectedMode === 'immediate' ? <Play className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                {selectedMode === 'immediate' ? 'Immediate Start' : 'Scheduled Start'}
              </div>
            </div>
            <button
              onClick={resetToSelection}
              className="inline-flex items-center px-3 py-1 text-sm transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1e293b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Change Mode
            </button>
          </div>

          <div 
            className="bg-white p-6 rounded-lg border"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              borderColor: '#e2e8f0'
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Time Between Captures (seconds)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-colors"
                    style={{ 
                      borderColor: '#d1d5db',
                      backgroundColor: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    min="1"
                  />
                  <Timer className="absolute right-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                </div>
              </div>

              {selectedMode === 'scheduled' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Start Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        min={getCurrentLocalDatetime()} 
                        className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-colors"
                        style={{ 
                          borderColor: '#d1d5db',
                          backgroundColor: '#ffffff'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#9333ea';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <Clock className="absolute right-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      End Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={startTime} 
                        className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-colors"
                        style={{ 
                          borderColor: '#d1d5db',
                          backgroundColor: '#ffffff'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#9333ea';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <Clock className="absolute right-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                    </div>

                    {/* Validation Message*/}
                    {endTime && startTime && new Date(endTime) < new Date(startTime) && (
                      <p className="text-red-600 text-sm mt-1">
                        End time must be after the start time.
                      </p>
                    )}
                    </div>
                  
                  {isScheduled && countdown !== null && (
                    <div 
                      className="p-6 rounded-lg border-2"
                      style={{
                        background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
                        borderColor: '#bbf7d0'
                      }}
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#166534' }}>
                          Scheduled Start In:
                        </h3>
                        <div className="text-3xl font-bold" style={{ color: '#14532d' }}>
                          {formatCountdown(countdown)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 pt-4">
                    <button 
                      onClick={handleSchedule}
                      disabled={countdown !== null}
                      className="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: countdown !== null ? '#e5e7eb' : '#9333ea',
                        color: countdown !== null ? '#9ca3af' : '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        if (countdown === null) {
                          e.currentTarget.style.backgroundColor = '#7c3aed';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (countdown === null) {
                          e.currentTarget.style.backgroundColor = '#9333ea';
                        }
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule Capture
                    </button>
                    <button 
                      onClick={onCancel}
                      className="inline-flex items-center px-6 py-3 border font-medium rounded-lg transition-colors"
                      style={{
                        borderColor: '#fca5a5',
                        color: '#dc2626',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      Duration (minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-colors"
                        style={{ 
                          borderColor: '#d1d5db',
                          backgroundColor: '#ffffff'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        min="1"
                      />
                      <Camera className="absolute right-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                    </div>
                  </div>

                  {deviceRunning && (
                    <div 
                      className="p-6 rounded-lg border-2"
                      style={{
                        background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
                        borderColor: '#93c5fd'
                      }}
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1e40af' }}>
                          Device is Running
                        </h3>
                        <p style={{ color: '#1d4ed8' }}>
                          Capturing every {interval} minutes for {duration} minutes total
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      onClick={startOceanEye}
                      disabled={deviceRunning}
                      className="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: deviceRunning ? '#e5e7eb' : '#3b82f6',
                        color: deviceRunning ? '#9ca3af' : '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        if (!deviceRunning) {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!deviceRunning) {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                        }
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Device
                    </button>
                    {/* <button
                      onClick={stopOceanEye}
                      disabled={!deviceRunning}
                      className="inline-flex items-center px-6 py-3 border font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: !deviceRunning ? '#e5e7eb' : '#fdba74',
                        color: !deviceRunning ? '#9ca3af' : '#ea580c',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (deviceRunning) {
                          e.currentTarget.style.backgroundColor = '#fff7ed';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deviceRunning) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Device
                    </button> */}
                    <button 
                      onClick={onCancel}
                      className="inline-flex items-center px-6 py-3 border font-medium rounded-lg transition-colors"
                      style={{
                        borderColor: '#fca5a5',
                        color: '#dc2626',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureSettings;