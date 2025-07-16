import React, { useState, useEffect } from 'react';
import { domainName } from "../../components/DomainName";
import { 
  Square, 
  X, 
  Play, 
  Pause, 
  Battery, 
  MapPin, 
  Wifi, 
  Signal,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DeviceStatusProps {
  onCancel: () => void;
  location: string;
  battery: number;
}

type DeviceState = 'starting' | 'active' | 'waiting' | 'stopped' | 'error';

const DeviceStatus: React.FC<DeviceStatusProps> = ({ onCancel, location, battery }) => {
  const [deviceRunning, setDeviceRunning] = useState(false);
  const [deviceState, setDeviceState] = useState<DeviceState>('starting');
  const [isLoading, setIsLoading] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [deviceStopped, setDeviceStopped] = useState(false);


  // Simulate device startup sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeviceState('active');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Uptime counter
  useEffect(() => {
    if (deviceState === 'active') {
      const interval = setInterval(() => {
        setUptime(prev => prev + 1);
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
        // Set device to not running immediately
        setDeviceRunning(false);
        const res = await fetch(`${domainName}mqtt/publish?topic=${encodeURIComponent(topic)}&message=${encodeURIComponent(message)}`, {
          method: "POST"
       //   headers: {
       //     "Content-Type": "application/json",
       //   },
       //   body: JSON.stringify(data),
        });
        const result = await res.text();
        console.log(result);
        alert("Device stop command sent");
      } catch (error) {
        console.error("Error sending stop signal", error);
        alert("Failed to send stop signal");
        setDeviceRunning(true); // Revert if failed
      }
    };


  const startDevice = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setDeviceState('starting');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeviceState('active');
      setUptime(0);
    } catch (error) {
      console.error("Error starting device", error);
      setDeviceState('error');
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
      maxWidth: '768px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
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
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Battery size={16} style={{ color: getBatteryColor() }} />
            <span style={{ color: '#6b7280' }}>Battery:</span>
            <span style={{ fontWeight: '500', color: getBatteryColor() }}>{battery}%</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Signal size={16} style={{ color: '#16a34a' }} />
            <span style={{ color: '#6b7280' }}>Signal:</span>
            <span style={{ fontWeight: '500', color: '#16a34a' }}>Strong</span>
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
        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
        gap: '12px'
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
              padding: '12px 24px',
              border: '2px solid #fca5a5',
              color: '#b91c1c',
              backgroundColor: 'transparent',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#fca5a5';
              }
            }}
          >
            {isLoading ? (
              <>
                <Spinner color="#b91c1c" />
                Stopping...
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
            onClick={startDevice}
            disabled={isLoading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              border: '2px solid #86efac',
              color: '#15803d',
              backgroundColor: 'transparent',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
                e.currentTarget.style.borderColor = '#4ade80';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#86efac';
              }
            }}
          >
            {isLoading ? (
              <>
                <Spinner color="#15803d" />
                Starting...
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
              padding: '12px 24px',
              border: '2px solid #d1d5db',
              color: '#6b7280',
              backgroundColor: 'transparent',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: 'not-allowed',
              opacity: 0.5,
              fontSize: '14px'
            }}
          >
            <Activity size={20} style={{ marginRight: '8px' }} />
            {deviceState === 'starting' ? 'Starting...' : 'Processing...'}
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          margin: 0
        }}>
          Device ID: OCE123 • Last Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
      <button
          onClick={onCancel}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            border: '2px solid #d1d5db',
            color: '#374151',
            backgroundColor: 'transparent',
            fontWeight: '500',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          <X size={20} style={{ marginRight: '8px' }} />
          Choose Another Device
        </button>
    </div>
  );
};

export default DeviceStatus;