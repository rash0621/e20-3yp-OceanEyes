package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.AccessibleDevice;
import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Repo.AccessibleDeviceRepo;
import com.example.OceanEyes.Repo.DeviceRepo;
import com.example.OceanEyes.Service.AccessibleDeviceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AccessibleDeviceServiceTest {

    @InjectMocks
    private AccessibleDeviceService accessibleDeviceService;

    @Mock
    private AccessibleDeviceRepo accessibleDeviceRepository;

    @Mock
    private DeviceRepo deviceRepository;

    @Mock
    private org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDeviceByDeviceIdFound() {
        String deviceId = "device123";

        AccessibleDevice accessibleDevice = new AccessibleDevice();
        accessibleDevice.setDeviceId(deviceId);

        Device device = new Device();
        device.setId(deviceId);

        when(accessibleDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.of(accessibleDevice));
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        Optional<Device> result = accessibleDeviceService.getDeviceByDeviceId(deviceId);

        assertTrue(result.isPresent());
        assertEquals(deviceId, result.get().getId());

        verify(accessibleDeviceRepository).findByDeviceId(deviceId);
        verify(deviceRepository).findById(deviceId);
    }

    @Test
    void testGetDeviceByDeviceIdNotFound() {
        String deviceId = "device123";

        when(accessibleDeviceRepository.findByDeviceId(deviceId)).thenReturn(Optional.empty());

        Optional<Device> result = accessibleDeviceService.getDeviceByDeviceId(deviceId);

        assertFalse(result.isPresent());

        verify(accessibleDeviceRepository).findByDeviceId(deviceId);
        verify(deviceRepository, never()).findById(anyString());
    }

    @Test
    void testGetDeviceByUserIdFound() {
        String userId = "user123";
        String deviceId = "device456";

        AccessibleDevice accessibleDevice = new AccessibleDevice();
        accessibleDevice.setDeviceId(deviceId);
        accessibleDevice.setUserId(userId);

        Device device = new Device();
        device.setId(deviceId);

        when(accessibleDeviceRepository.findByUserId(userId)).thenReturn(Optional.of(accessibleDevice));
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));

        Optional<Device> result = accessibleDeviceService.getDeviceByUserId(userId);

        assertTrue(result.isPresent());
        assertEquals(deviceId, result.get().getId());

        verify(accessibleDeviceRepository).findByUserId(userId);
        verify(deviceRepository).findById(deviceId);
    }

    @Test
    void testGetDeviceByUserIdNotFound() {
        String userId = "user123";

        when(accessibleDeviceRepository.findByUserId(userId)).thenReturn(Optional.empty());

        Optional<Device> result = accessibleDeviceService.getDeviceByUserId(userId);

        assertFalse(result.isPresent());

        verify(accessibleDeviceRepository).findByUserId(userId);
        verify(deviceRepository, never()).findById(anyString());
    }

    @Test
    void testLoginNewDeviceSuccess() {
        Device inputDevice = new Device();
        inputDevice.setDeviceName("MyDevice");
        inputDevice.setDevicePassword("rawPassword");

        Device dbDevice = new Device();
        dbDevice.setDeviceName("MyDevice");
        dbDevice.setDevicePassword("encodedPassword");

        when(deviceRepository.findByDeviceName("MyDevice")).thenReturn(Optional.of(dbDevice));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);

        boolean result = accessibleDeviceService.loginNewDevice(inputDevice);

        assertTrue(result);

        verify(deviceRepository).findByDeviceName("MyDevice");
        verify(passwordEncoder).matches("rawPassword", "encodedPassword");
    }

    @Test
    void testLoginNewDeviceFailureWrongPassword() {
        Device inputDevice = new Device();
        inputDevice.setDeviceName("MyDevice");
        inputDevice.setDevicePassword("wrongPassword");

        Device dbDevice = new Device();
        dbDevice.setDeviceName("MyDevice");
        dbDevice.setDevicePassword("encodedPassword");

        when(deviceRepository.findByDeviceName("MyDevice")).thenReturn(Optional.of(dbDevice));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        boolean result = accessibleDeviceService.loginNewDevice(inputDevice);

        assertFalse(result);

        verify(deviceRepository).findByDeviceName("MyDevice");
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
    }

    @Test
    void testLoginNewDeviceDeviceNotFound() {
        Device inputDevice = new Device();
        inputDevice.setDeviceName("UnknownDevice");
        inputDevice.setDevicePassword("password");

        when(deviceRepository.findByDeviceName("UnknownDevice")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accessibleDeviceService.loginNewDevice(inputDevice);
        });

        assertEquals("Device not found", exception.getMessage());

        verify(deviceRepository).findByDeviceName("UnknownDevice");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}
