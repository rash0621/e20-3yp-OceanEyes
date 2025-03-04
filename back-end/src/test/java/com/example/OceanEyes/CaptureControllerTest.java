package com.example.OceanEyes;

import com.example.OceanEyes.Controller.CaptureController;
import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.data.mongodb.gridfs.GridFsResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CaptureControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CaptureService captureService;

    @Mock
    private FileService fileService;

    @InjectMocks
    private CaptureController captureController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(captureController).build();
    }

    @Test
    void testGetImage_Success() throws Exception {
        byte[] mockImageData = "mock image data".getBytes();
        GridFsResource mockResource = mock(GridFsResource.class);
        when(mockResource.getInputStream()).thenReturn(new ByteArrayInputStream(mockImageData));
        when(fileService.getFile(anyString())).thenReturn(Optional.of(mockResource));

        mockMvc.perform(get("/api/v1/capture/image/{imageId}", "123"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(content().bytes(mockImageData));

        verify(fileService, times(1)).getFile("123");
    }

    @Test
    void testGetImage_NotFound() throws Exception {
        when(fileService.getFile(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/capture/image/{imageId}", "123"))
                .andExpect(status().isNotFound());

        verify(fileService, times(1)).getFile("123");
    }

    @Test
    void testGetImage_ServerError() throws Exception {
        GridFsResource mockResource = mock(GridFsResource.class);
        when(mockResource.getInputStream()).thenThrow(new IOException("IO Error"));
        when(fileService.getFile(anyString())).thenReturn(Optional.of(mockResource));

        mockMvc.perform(get("/api/v1/capture/image/{imageId}", "123"))
                .andExpect(status().isInternalServerError());

        verify(fileService, times(1)).getFile("123");
    }
}
