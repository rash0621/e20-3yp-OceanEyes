package com.example.OceanEyes.ControllerTest;

import com.example.OceanEyes.Config.JwtUtil;
import com.example.OceanEyes.Controller.DeviceController;
import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Entity.User;
import com.example.OceanEyes.Service.DeviceService;
import com.example.OceanEyes.Service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DeviceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DeviceService deviceService;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private DeviceController deviceController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(deviceController).build();
    }

    @Test
    void testSaveDevice_Success() throws Exception {
        Device mockDevice = new Device();
        mockDevice.setId("device123");

        when(deviceService.addNewDevice(any(Device.class))).thenReturn(true);
        when(jwtUtil.generateToken(anyString())).thenReturn("mockToken");

        mockMvc.perform(post("/api/v1/device/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockDevice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Device created successfully"))
                .andExpect(jsonPath("$.data").value("mockToken"));

        verify(deviceService, times(1)).addNewDevice(any(Device.class));
        verify(jwtUtil, times(1)).generateToken(anyString());
    }

    @Test
    void testSaveDevice_Failure() throws Exception {
        Device mockDevice = new Device();

        when(deviceService.addNewDevice(any(Device.class))).thenReturn(false);

        mockMvc.perform(post("/api/v1/device/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockDevice)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Device creation failed"));

        verify(deviceService, times(1)).addNewDevice(any(Device.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void testSaveDevice_Exception() throws Exception {
        Device mockDevice = new Device();

        when(deviceService.addNewDevice(any(Device.class))).thenThrow(new RuntimeException("Name already exists"));

        mockMvc.perform(post("/api/v1/device/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockDevice)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Name already exists"));

        verify(deviceService, times(1)).addNewDevice(any(Device.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void testDeleteDevice_Success() throws Exception {
        doNothing().when(deviceService).deleteDevice(anyString());

        mockMvc.perform(delete("/api/v1/device/delete/{id}", "device123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Device deleted successfully"));

        verify(deviceService, times(1)).deleteDevice("device123");
    }

    @Test
    void testDeleteDevice_Failure() throws Exception {
        doThrow(new RuntimeException("Device deletion failed")).when(deviceService).deleteDevice(anyString());

        mockMvc.perform(delete("/api/v1/device/delete/{id}", "device123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Device deletion failed"));

        verify(deviceService, times(1)).deleteDevice("device123");
    }

    @Test
    void testLoginDevice_InvalidCredentials() throws Exception {
        when(deviceService.loginNewDevice(any(Device.class))).thenReturn(false);

        mockMvc.perform(post("/api/v1/device/loginDevice")
                        .param("deviceName", "dev1")
                        .param("devicePassword", "wrong")
                        .param("userId", "user123"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Error in credentials"));

        verify(deviceService, times(1)).loginNewDevice(any(Device.class));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void testLoginDevice_UserNotFound() throws Exception {
        when(deviceService.loginNewDevice(any(Device.class))).thenReturn(true);
        when(userService.getUserById(anyString())).thenReturn(null);

        mockMvc.perform(post("/api/v1/device/loginDevice")
                        .param("deviceName", "dev1")
                        .param("devicePassword", "pass")
                        .param("userId", "invalidUser"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("No such user exists"));

        verify(deviceService, times(1)).loginNewDevice(any(Device.class));
    }

    @Test
    void testLoginDevice_Exception() throws Exception {
        when(deviceService.loginNewDevice(any(Device.class))).thenThrow(new RuntimeException("Some error"));

        mockMvc.perform(post("/api/v1/device/loginDevice")
                        .param("deviceName", "dev1")
                        .param("devicePassword", "pass")
                        .param("userId", "user123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Error in logging"));

        verify(deviceService, times(1)).loginNewDevice(any(Device.class));
    }
}
