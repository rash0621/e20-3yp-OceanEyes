package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Repo.CaptureRepo;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CaptureServiceTest {

    @InjectMocks
    private CaptureService captureService;

    @Mock
    private CaptureRepo captureRepo;

    @Mock
    private FileService fileService;

    @Mock
    private MultipartFile multipartFile;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveCaptureSuccess() throws IOException {
        String turnId = "turn123";
        String angle = "45";
        Float distance = 12.5f;
        String imageId = "img123";

        when(fileService.saveFile(multipartFile)).thenReturn(imageId);

        Capture savedCapture = new Capture();
        savedCapture.setTurnId(turnId);
        savedCapture.setImageId(imageId);
        savedCapture.setAngle(angle);
        savedCapture.setDistance(distance);

        when(captureRepo.save(any(Capture.class))).thenReturn(savedCapture);

        Capture result = captureService.saveCapture(turnId, multipartFile, angle, distance);

        assertNotNull(result);
        assertEquals(turnId, result.getTurnId());
        assertEquals(imageId, result.getImageId());
        assertEquals(angle, result.getAngle());
        assertEquals(distance, result.getDistance());

        verify(fileService).saveFile(multipartFile);
        verify(captureRepo).save(any(Capture.class));
    }

    @Test
    void testSaveCaptureFailsWhenImageIdNull() throws IOException {
        when(fileService.saveFile(multipartFile)).thenReturn(null);

        IOException exception = assertThrows(IOException.class, () -> {
            captureService.saveCapture("turnId", multipartFile, "angle", 1.0f);
        });

        assertEquals("Failed to save image file. imageId is null.", exception.getMessage());

        verify(fileService).saveFile(multipartFile);
        verify(captureRepo, never()).save(any());
    }

    @Test
    void testGetCapturesByTurnId() {
        String turnId = "turn123";
        Capture capture1 = new Capture();
        capture1.setTurnId(turnId);

        Capture capture2 = new Capture();
        capture2.setTurnId(turnId);

        List<Capture> captures = Arrays.asList(capture1, capture2);

        when(captureRepo.findByTurnId(turnId)).thenReturn(captures);

        List<Capture> result = captureService.getCapturesByTurnId(turnId);

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(c -> turnId.equals(c.getTurnId())));

        verify(captureRepo).findByTurnId(turnId);
    }

    @Test
    void testGetAllCaptures() {
        Capture capture1 = new Capture();
        Capture capture2 = new Capture();

        List<Capture> captures = Arrays.asList(capture1, capture2);

        when(captureRepo.findAll()).thenReturn(captures);

        List<Capture> result = captureService.getAllCaptures();

        assertEquals(2, result.size());

        verify(captureRepo).findAll();
    }
}
