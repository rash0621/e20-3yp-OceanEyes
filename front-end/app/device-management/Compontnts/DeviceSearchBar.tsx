import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Chip, 
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { Device } from "../types";

interface DeviceSearchBarProps {
  devices: Device[];
  onFilteredDevicesChange: (filteredDevices: Device[]) => void;
  selectedDeviceId: string | null;
}

const DeviceSearchBar: React.FC<DeviceSearchBarProps> = ({
  devices,
  onFilteredDevicesChange,
  selectedDeviceId
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter devices based on search term
  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return devices;
    
    const term = searchTerm.toLowerCase();
    return devices.filter(device => 
      device.name?.toLowerCase().includes(term) || 
      device.id?.toLowerCase().includes(term) ||
      device.lastLocation?.toLowerCase().includes(term)
    );
  }, [devices, searchTerm]);

  // Update parent component when filtered devices change
  React.useEffect(() => {
    onFilteredDevicesChange(filteredDevices);
  }, [filteredDevices, onFilteredDevicesChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const resultCount = filteredDevices.length;
  const totalCount = devices.length;
  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Poppins',
            fontWeight: 600,
            color: '#1e293b',
            fontSize: '18px'
          }}
        >
          Select Device
        </Typography>
        
        {hasActiveSearch && (
          <Chip
            icon={<FilterList />}
            label={`${resultCount} filtered`}
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontFamily: 'Poppins',
              fontWeight: 500
            }}
          />
        )}
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by Device Name, Device ID, or Location..."
        value={searchTerm}
        onChange={handleSearchChange}
        variant="outlined"
        size="medium"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            fontFamily: 'Poppins',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#bdbdbd',
              }
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
                borderWidth: '2px',
              }
            }
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
            fontSize: '14px',
            '&::placeholder': {
              color: '#9e9e9e',
              opacity: 1,
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
            transition: 'border-color 0.2s ease',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search 
                sx={{ 
                  color: hasActiveSearch ? '#1976d2' : '#9e9e9e',
                  fontSize: '20px',
                  transition: 'color 0.2s ease'
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClearSearch}
                size="small"
                sx={{
                  color: '#9e9e9e',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    color: '#757575',
                  }
                }}
              >
                <Clear sx={{ fontSize: '18px' }} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* Search Results Info */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Poppins',
            color: '#64748b',
            fontSize: '13px'
          }}
        >
          {hasActiveSearch ? (
            resultCount === 0 ? (
              <span style={{ color: '#ef4444' }}>
                No devices found matching "{searchTerm}"
              </span>
            ) : (
              <>
                Showing <strong>{resultCount}</strong> of <strong>{totalCount}</strong> devices
                {resultCount !== totalCount && (
                  <span style={{ color: '#1976d2', marginLeft: '4px' }}>
                    for "{searchTerm}"
                  </span>
                )}
              </>
            )
          ) : (
            <>Total <strong>{totalCount}</strong> devices available</>
          )}
        </Typography>

        {selectedDeviceId && (
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Poppins',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            ✓ Device selected
          </Typography>
        )}
      </Box>

      {/* No Results State */}
      {hasActiveSearch && resultCount === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 4,
            mt: 2,
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}
        >
          <Search sx={{ fontSize: '48px', color: '#bdbdbd', mb: 1 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Poppins',
              color: '#757575',
              fontSize: '16px',
              fontWeight: 500,
              mb: 1
            }}
          >
            No devices found
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Poppins',
              color: '#9e9e9e',
              fontSize: '14px'
            }}
          >
            Try adjusting your search terms or{' '}
            <span 
              style={{ 
                color: '#1976d2', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={handleClearSearch}
            >
              clear the search
            </span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DeviceSearchBar;