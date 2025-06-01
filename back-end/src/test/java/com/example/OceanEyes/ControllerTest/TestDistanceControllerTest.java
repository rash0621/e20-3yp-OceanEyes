package com.example.OceanEyes.ControllerTest;

import com.example.OceanEyes.Controller.TestDistanceController;
import com.example.OceanEyes.Entity.TestDistance;
import com.example.OceanEyes.Service.TestDistanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TestDistanceControllerTest {

    @Mock
    private TestDistanceService testDistanceService;

    @InjectMocks
    private TestDistanceController testDistanceController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateTestDistance() throws IOException {
        Double distance = 10.5;
        TestDistance saved = new TestDistance();
        saved.setDistance(distance);

        when(testDistanceService.saveTestDistance(distance)).thenReturn(saved);

        ResponseEntity<TestDistance> response = testDistanceController.createTestDistance(distance);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(saved, response.getBody());

        verify(testDistanceService, times(1)).saveTestDistance(distance);
    }

    @Test
    public void testGetTestDistanceFound() {
        Long id = 1L;
        TestDistance td1 = new TestDistance();
        TestDistance td2 = new TestDistance();
        List<TestDistance> testDistances = Arrays.asList(td1, td2);

        when(testDistanceService.getTestDistanceById(id)).thenReturn(testDistances);

        ResponseEntity<List<TestDistance>> response = testDistanceController.getTestDistance(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(testDistances, response.getBody());

        verify(testDistanceService, times(1)).getTestDistanceById(id);
    }

    @Test
    public void testGetTestDistanceNotFound() {
        Long id = 1L;

        when(testDistanceService.getTestDistanceById(id)).thenReturn(Collections.emptyList());

        ResponseEntity<List<TestDistance>> response = testDistanceController.getTestDistance(id);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(testDistanceService, times(1)).getTestDistanceById(id);
    }

    @Test
    public void testGetAll() {
        TestDistance td1 = new TestDistance();
        TestDistance td2 = new TestDistance();
        List<TestDistance> allDistances = Arrays.asList(td1, td2);

        when(testDistanceService.getAllDistances()).thenReturn(allDistances);

        List<TestDistance> result = testDistanceController.getAll();

        assertEquals(2, result.size());
        assertEquals(allDistances, result);

        verify(testDistanceService, times(1)).getAllDistances();
    }
}
