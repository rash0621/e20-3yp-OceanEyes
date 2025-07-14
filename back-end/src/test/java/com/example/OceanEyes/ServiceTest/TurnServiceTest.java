package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Repo.TurnRepo;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.Service.TurnService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TurnServiceTest {

    @Mock
    private TurnRepo turnRepo;

    @Mock
    private FileService fileService;

    @InjectMocks
    private TurnService turnService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void saveTurn_shouldSaveAndReturnTurn() throws Exception {
        String instanceId = "inst1";
        LocalDate date = LocalDate.of(2025, 6, 1);
        LocalTime time = LocalTime.of(12, 30);
        Float longitude = 40.7128f;
        Float latitude = -74.0060f;

        Turn savedTurn = new Turn();
        savedTurn.setInstanceId(instanceId);
        savedTurn.setDate(date);
        savedTurn.setTime(time);
        savedTurn.setGpsLocationLongitude(longitude);
        savedTurn.setGpsLocationLatitude(latitude);

        when(turnRepo.save(any(Turn.class))).thenReturn(savedTurn);

        Turn result = turnService.saveTurn(instanceId, date, time, longitude, latitude);

        assertNotNull(result);
        assertEquals(instanceId, result.getInstanceId());
        assertEquals(date, result.getDate());
        assertEquals(time, result.getTime());
        assertEquals(longitude, result.getGpsLocationLongitude());
        assertEquals(latitude, result.getGpsLocationLatitude());

        verify(turnRepo, times(1)).save(any(Turn.class));
    }

    @Test
    void getTurnsById_shouldReturnTurnList() {
        String turnId = "turn123";
        Turn turn = new Turn();
        turn.setId(turnId);

        when(turnRepo.findTurnById(turnId)).thenReturn(Collections.singletonList(turn));

        List<Turn> turns = turnService.getTurnsById(turnId);

        assertNotNull(turns);
        assertEquals(1, turns.size());
        assertEquals(turnId, turns.get(0).getId());

        verify(turnRepo, times(1)).findTurnById(turnId);
    }

    @Test
    void getTurnsByInstanceId_shouldReturnTurnList() {
        String instanceId = "inst1";
        Turn turn = new Turn();
        turn.setInstanceId(instanceId);

        when(turnRepo.findByInstanceId(instanceId)).thenReturn(Collections.singletonList(turn));

        List<Turn> turns = turnService.getTurnsByInstanceId(instanceId);

        assertNotNull(turns);
        assertEquals(1, turns.size());
        assertEquals(instanceId, turns.get(0).getInstanceId());

        verify(turnRepo, times(1)).findByInstanceId(instanceId);
    }

    @Test
    void getAllTurns_shouldReturnAllTurns() {
        Turn turn1 = new Turn();
        Turn turn2 = new Turn();

        when(turnRepo.findAll()).thenReturn(List.of(turn1, turn2));

        List<Turn> turns = turnService.getAllTurns();

        assertNotNull(turns);
        assertEquals(2, turns.size());

        verify(turnRepo, times(1)).findAll();
    }
}
