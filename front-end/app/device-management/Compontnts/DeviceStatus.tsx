import React, { useState, useEffect } from 'react';
import { domainName } from "../../components/DomainName";
import { 
  Square, 
  X, 
  Play, 
  Pause, 
  Battery, 
  RefreshCw,
  MapPin, 
  Wifi, 
  Signal,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface DeviceStatusProps {
  onCancel: () => void;
  location: string;
  battery: number;
}

type DeviceState = 'starting' | 'active' | 'waiting' | 'stopped' | 'error';

const DeviceStatus: React.FC<DeviceStatusProps> = ({ onCancel, location, battery }) => {
  const [deviceRunning, setDeviceRunning] = useState(true);
  const [deviceState, setDeviceState] = useState<DeviceState>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [deviceStopped, setDeviceStopped] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Check device status on component mount
  useEffect(() => {
    const checkDeviceStatus = async () => {
      try {
        // Check if there's a stored state in memory
        const storedState = getStoredDeviceState();
        if (storedState) {
          // If we have a stored state, use it
          setDeviceState(storedState);
          setDeviceRunning(storedState === 'active');
        } else {
          // If no stored state, assume device is active (original behavior)
          // This handles the first time the component loads
          setDeviceState('active');
          setDeviceRunning(true);
          storeDeviceState('active');
        }
      } catch (error) {
        console.error('Error checking device status:', error);
        setDeviceState('error');
      }
    };

    checkDeviceStatus();
  }, []);

  // Store device state in memory (you could also use sessionStorage if needed)
  const storeDeviceState = (state: DeviceState) => {
    // Since we can't use localStorage in artifacts, we'll use a simple in-memory storage
    (window as any).deviceState = state;
  };

  const getStoredDeviceState = (): DeviceState | null => {
    return (window as any).deviceState || null;
  };

  // Uptime counter - only run when device is active
  useEffect(() => {
    if (deviceState === 'active') {
      const interval = setInterval(() => {
        setUptime(prev => prev + 1);
        setLastUpdate(new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [deviceState]);

  const stopOceanEye = async () => {
    const topic = "raspi/TestDevice1/stop";
    const message = JSON.stringify({
      instanceId: "OCE123",
    });
    
    try {
      setIsLoading(true);
      setDeviceState('waiting');
      setDeviceRunning(false);
      
      const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
        method: "POST"
      });
      
      setDeviceState('stopped');
      storeDeviceState('stopped'); // Store the state
      const result = await res.text();
      console.log(result);
      alert("Device stop command sent");
    } catch (error) {
      console.error("Error sending stop signal", error);
      alert("Failed to send stop signal");
      setDeviceRunning(true);
      setDeviceState('error');
      storeDeviceState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const startOceanEye = async () => {
    const topic = "raspi/TestDevice1/start";
    const now = new Date(Date.now());
    const startDateTime = now.toISOString().slice(0, 19);
    const message = JSON.stringify({
      instanceId: "OCE123",
      startDateTime: startDateTime,
      end_time: "",
      timeBetweenTurns: 30,
    });
    
    try {
      setIsLoading(true);
      setDeviceState('starting');
      setDeviceRunning(true);
      
      const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
        method: "POST"
      });
      
      const result = await res.text();
      
      // Simulate startup time and then set to active
      setTimeout(() => {
        setDeviceState('active');
        storeDeviceState('active'); // Store the state
        setUptime(0);
      }, 3000); // 3 second startup simulation
      
      console.log(result);
      alert("Device start command sent");
    } catch (error) {
      console.error("Error sending start signal", error);
      alert("Failed to send start signal");
      setDeviceState('error');
      setDeviceRunning(false);
      storeDeviceState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (deviceState) {
      case 'starting':
        return {
          color: '#2563eb',
          bgColor: '#eff6ff',
          borderColor: '#bfdbfe',
          icon: <Activity size={20} style={{ color: '#2563eb' }} />,
          text: 'Starting up...',
          description: 'Initializing device systems'
        };
      case 'active':
        return {
          color: '#16a34a',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          icon: <CheckCircle size={20} style={{ color: '#16a34a' }} />,
          text: 'Active',
          description: 'Device is capturing data'
        };
      case 'waiting':
        return {
          color: '#ca8a04',
          bgColor: '#fefce8',
          borderColor: '#fde047',
          icon: <Clock size={20} style={{ color: '#ca8a04' }} />,
          text: 'Waiting',
          description: 'Awaiting command'
        };
      case 'stopped':
        return {
          color: '#6b7280',
          bgColor: '#f9fafb',
          borderColor: '#d1d5db',
          icon: <Pause size={20} style={{ color: '#6b7280' }} />,
          text: 'Stopped',
          description: 'Device is offline'
        };
      case 'error':
        return {
          color: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          icon: <AlertCircle size={20} style={{ color: '#dc2626' }} />,
          text: 'Error',
          description: 'Connection failed'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#f9fafb',
          borderColor: '#d1d5db',
          icon: <Activity size={20} style={{ color: '#6b7280' }} />,
          text: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = () => {
    if (battery > 60) return '#16a34a';
    if (battery > 30) return '#ca8a04';
    return '#dc2626';
  };

  const statusConfig = getStatusConfig();

  const LoadingDots = () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#2563eb',
            borderRadius: '50%',
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );

  const Spinner = ({ color = '#2563eb' }) => (
    <div
      style={{
        width: '20px',
        height: '20px',
        border: `2px solid ${color}33`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '8px'
      }}
    >
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const PulsingIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      {children}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      padding: window.innerWidth < 768 ? '30px' : '25px',
      backgroundColor: 'white',
      borderRadius: window.innerWidth < 768 ? '8px' : '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: '0 0 8px 0' 
        }}>
          Device Status
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>OceanEye Device Monitor</p>
      </div>

      {/* Status Card */}
      <div style={{
        borderRadius: '8px',
        border: `2px solid ${statusConfig.borderColor}`,
        backgroundColor: statusConfig.bgColor,
        padding: window.innerWidth < 768 ? '30px' : '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth < 768 ? '8px' : '12px' }}>
            {deviceState === 'starting' ? (
              <PulsingIcon>{statusConfig.icon}</PulsingIcon>
            ) : (
              statusConfig.icon
            )}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: statusConfig.color,
                margin: '0 0 4px 0'
              }}>
                {statusConfig.text}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {statusConfig.description}
              </p>
            </div>
          </div>
          
          {deviceState === 'starting' && <LoadingDots />}
        </div>

        {/* Device Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <MapPin size={16} style={{ color: '#6b7280' }} />
            <span style={{ color: '#6b7280' }}>Location:</span>
            <span style={{ fontWeight: '500', color: '#111827' }}>{location}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Signal size={16} style={{ color: '#f1a61bff' }} />
            <span style={{ color: '#6b7280' }}>Signal:</span>
            <span style={{ fontWeight: '500', color: '#f1a61bff' }}>Mild</span>
          </div>
        </div>

        {/* Additional Stats */}
        {deviceState === 'active' && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#6b7280' }} />
                <span style={{ color: '#6b7280' }}>Uptime: {formatUptime(uptime)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={16} style={{ color: '#16a34a' }} />
                <span style={{ color: '#16a34a' }}>Connected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          width: '100%',
          maxWidth: '500px'
        }}>
          {deviceState === 'active' ? (
            <button
              onClick={stopOceanEye}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Spinner color="white" />
                  Stopping Device...
                </>
              ) : (
                <>
                  <Square size={20} style={{ marginRight: '8px' }} />
                  Stop Device
                </>
              )}
            </button>
          ) : deviceState === 'stopped' ? (
            <button
              onClick={startOceanEye}
              disabled={isLoading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Spinner color="white" />
                  Starting Device...
                </>
              ) : (
                <>
                  <Play size={20} style={{ marginRight: '8px' }} />
                  Start Device
                </>
              )}
            </button>
          ) : (
            <button
              disabled={true}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'not-allowed',
                opacity: 0.6,
                fontSize: '16px'
              }}
            >
              <Activity size={20} style={{ marginRight: '8px' }} />
              {deviceState === 'starting' ? 'Starting...' : 'Processing...'}
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            color: '#475569',
            border: '2px solid #cbd5e1',
            fontWeight: '500',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = '#94a3b8';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(148, 163, 184, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <RefreshCw size={16} style={{ marginRight: '8px' }} />
          Choose Another Device
        </button>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <Settings size={16} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            Device ID: OCE123
          </span>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: 0
        }}>
          Last Updated: {lastUpdate.toLocaleTimeString()} • System Status: Normal
        </p>
      </div>
    </div>
  );
};

export default DeviceStatus;