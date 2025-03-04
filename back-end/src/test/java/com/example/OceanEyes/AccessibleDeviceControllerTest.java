package com.example.OceanEyes;

import com.example.OceanEyes.Controller.AccessibleDeviceController;
import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Entity.AccessibleDevice;
import com.example.OceanEyes.Service.AccessibleDeviceService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Date;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccessibleDeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private AccessibleDeviceService accessibleDeviceService;

    @InjectMocks
    private AccessibleDeviceController accessibleDeviceController;

    private Device device;
    private AccessibleDevice accessibleDevice;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(accessibleDeviceController).build();

        // Create a sample device for testing with a timestamp (Date)
        device = new Device("1", "deviceName", "devicePassword");
        accessibleDevice = new AccessibleDevice("1", "deviceName", "devicePassword", new Date());  // Passing Date
    }

    @Test
    void testLoginDevice_Success() throws Exception {
        when(accessibleDeviceService.loginNewDevice(any(Device.class))).thenReturn(true);

        MvcResult result = mockMvc.perform(post("/api/v1/accessibleDevice/loginDevice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(device)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Successfully logged in"))
                .andExpect(jsonPath("$.data").value(device.getId()))
                .andReturn();

        verify(accessibleDeviceService, times(1)).loginNewDevice(any(Device.class));
    }

    @Test
    void testLoginDevice_Failure() throws Exception {
        when(accessibleDeviceService.loginNewDevice(any(Device.class))).thenReturn(false);

        mockMvc.perform(post("/api/v1/accessibleDevice/loginDevice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(device)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Invalid Credentials"))
                .andExpect(jsonPath("$.data").isEmpty());

        verify(accessibleDeviceService, times(1)).loginNewDevice(any(Device.class));
    }

    @Test
    void testDeleteDevice_Success() throws Exception {
        doNothing().when(accessibleDeviceService).deleteAccessibleDevice(anyString());

        mockMvc.perform(delete("/api/v1/accessibleDevice/delete/{id}", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Device deleted successfully"))
                .andExpect(jsonPath("$.data").isEmpty());

        verify(accessibleDeviceService, times(1)).deleteAccessibleDevice(anyString());
    }

    @Test
    void testDeleteDevice_Failure() throws Exception {
        doThrow(new RuntimeException("Error")).when(accessibleDeviceService).deleteAccessibleDevice(anyString());

        mockMvc.perform(delete("/api/v1/accessibleDevice/delete/{id}", "1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("FAIL"))
                .andExpect(jsonPath("$.message").value("Device deletion failed"))
                .andExpect(jsonPath("$.data").isEmpty());

        verify(accessibleDeviceService, times(1)).deleteAccessibleDevice(anyString());
    }

    @Test
    void testGetAllDevices_Success() throws Exception {
        when(accessibleDeviceService.getDeviceByUserId(anyString())).thenReturn(Optional.of(device));

        mockMvc.perform(get("/api/v1/accessibleDevice/getAll/{userId}", "user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(device.getId()));

        verify(accessibleDeviceService, times(1)).getDeviceByUserId(anyString());
    }
}

