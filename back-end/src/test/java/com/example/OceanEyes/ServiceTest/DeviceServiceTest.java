package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Repo.DeviceRepo;
import com.example.OceanEyes.Service.DeviceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DeviceServiceTest {

    @InjectMocks
    private DeviceService deviceService;

    @Mock
    private DeviceRepo deviceRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveOrUpdate() {
        Device device = new Device();
        device.setDeviceName("device1");

        deviceService.saveOrUpdate(device);

        verify(deviceRepository).save(device);
    }

    @Test
    void testDeleteDevice() {
        String deviceId = "123";

        deviceService.deleteDevice(deviceId);

        verify(deviceRepository).deleteById(deviceId);
    }

    @Test
    void testAddNewDeviceSuccess() {
        Device device = new Device();
        device.setDeviceName("device1");
        device.setDevicePassword("rawPassword");

        when(deviceRepository.findByDeviceName(device.getDeviceName())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");

        boolean result = deviceService.addNewDevice(device);

        assertTrue(result);
        assertEquals("encodedPassword", device.getDevicePassword());
        verify(deviceRepository).save(device);
    }

    @Test
    void testAddNewDeviceNameAlreadyExists() {
        Device device = new Device();
        device.setDeviceName("device1");

        when(deviceRepository.findByDeviceName(device.getDeviceName()))
                .thenReturn(Optional.of(new Device()));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            deviceService.addNewDevice(device);
        });

        assertEquals("Name already exists", exception.getMessage());
        verify(deviceRepository, never()).save(any());
    }

    @Test
    void testAddNewDeviceSaveFailsReturnsFalse() {
        Device device = new Device();
        device.setDeviceName("device1");
        device.setDevicePassword("rawPassword");

        when(deviceRepository.findByDeviceName(device.getDeviceName())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        doThrow(new RuntimeException("DB error")).when(deviceRepository).save(any(Device.class));

        boolean result = deviceService.addNewDevice(device);

        assertFalse(result);
    }

    @Test
    void testLoginNewDeviceSuccess() {
        String rawPassword = "rawPass";
        String encodedPassword = "encodedPass";

        Device deviceInDb = new Device();
        deviceInDb.setDeviceName("device1");
        deviceInDb.setDevicePassword(encodedPassword);

        Device loginDevice = new Device();
        loginDevice.setDeviceName("device1");
        loginDevice.setDevicePassword(rawPassword);

        when(deviceRepository.findByDeviceName("device1")).thenReturn(Optional.of(deviceInDb));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);

        boolean result = deviceService.loginNewDevice(loginDevice);

        assertTrue(result);
    }

    @Test
    void testLoginNewDeviceWrongPassword() {
        String rawPassword = "rawPass";
        String encodedPassword = "encodedPass";

        Device deviceInDb = new Device();
        deviceInDb.setDeviceName("device1");
        deviceInDb.setDevicePassword(encodedPassword);

        Device loginDevice = new Device();
        loginDevice.setDeviceName("device1");
        loginDevice.setDevicePassword(rawPassword);

        when(deviceRepository.findByDeviceName("device1")).thenReturn(Optional.of(deviceInDb));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(false);

        boolean result = deviceService.loginNewDevice(loginDevice);

        assertFalse(result);
    }

    @Test
    void testLoginNewDeviceNotFoundThrows() {
        Device loginDevice = new Device();
        loginDevice.setDeviceName("device1");

        when(deviceRepository.findByDeviceName("device1")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            deviceService.loginNewDevice(loginDevice);
        });

        assertEquals("Device not found", exception.getMessage());
    }
}
