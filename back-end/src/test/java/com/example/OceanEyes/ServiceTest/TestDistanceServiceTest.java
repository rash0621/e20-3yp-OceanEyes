package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.TestDistance;
import com.example.OceanEyes.Repo.TestDistanceRepo;
import com.example.OceanEyes.Service.TestDistanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TestDistanceServiceTest {

    @Mock
    private TestDistanceRepo testDistanceRepo;

    @InjectMocks
    private TestDistanceService testDistanceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void saveTestDistance_shouldSaveAndReturnEntity() throws IOException {
        double distance = 123.45;
        TestDistance savedDistance = new TestDistance();
        savedDistance.setDistance(distance);

        when(testDistanceRepo.save(any(TestDistance.class))).thenReturn(savedDistance);

        TestDistance result = testDistanceService.saveTestDistance(distance);

        assertNotNull(result);
        assertEquals(distance, result.getDistance());

        verify(testDistanceRepo, times(1)).save(any(TestDistance.class));
    }

    @Test
    void getAllDistances_shouldReturnAll() {
        TestDistance td1 = new TestDistance();
        TestDistance td2 = new TestDistance();

        when(testDistanceRepo.findAll()).thenReturn(List.of(td1, td2));

        List<TestDistance> result = testDistanceService.getAllDistances();

        assertNotNull(result);
        assertEquals(2, result.size());

        verify(testDistanceRepo, times(1)).findAll();
    }
}
