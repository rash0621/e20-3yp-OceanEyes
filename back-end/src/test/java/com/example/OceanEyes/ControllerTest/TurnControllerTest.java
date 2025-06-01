package com.example.OceanEyes.ControllerTest;

import com.example.OceanEyes.Controller.TurnController;
import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.TurnService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TurnControllerTest {

    @Mock
    private TurnService turnService;

    @Mock
    private CaptureService captureService;

    @InjectMocks
    private TurnController turnController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetTurnsByInstanceIdSuccess() {
        String instanceId = "instance123";
        List<Turn> turnList = Arrays.asList(new Turn(), new Turn());

        when(turnService.getTurnsByInstanceId(instanceId)).thenReturn(turnList);

        ResponseEntity<ActionStatusMessage<Iterable<Turn>>> response = turnController.getTurnsByInstanceId(instanceId);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("SUCCESS", response.getBody().getStatus());
        assertEquals(turnList, response.getBody().getData());

        verify(turnService, times(1)).getTurnsByInstanceId(instanceId);
    }

    @Test
    public void testGetTurnsByInstanceIdException() {
        String instanceId = "instance123";

        when(turnService.getTurnsByInstanceId(instanceId)).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<ActionStatusMessage<Iterable<Turn>>> response = turnController.getTurnsByInstanceId(instanceId);

        assertEquals(500, response.getStatusCodeValue());
        assertEquals("FAIL", response.getBody().getStatus());

        verify(turnService, times(1)).getTurnsByInstanceId(instanceId);
    }

    @Test
    public void testGetAllTurns() {
        List<Turn> turnList = Arrays.asList(new Turn(), new Turn());

        when(turnService.getAllTurns()).thenReturn(turnList);

        List<Turn> result = turnController.getAllTurns();

        assertEquals(2, result.size());
        verify(turnService, times(1)).getAllTurns();
    }
}

