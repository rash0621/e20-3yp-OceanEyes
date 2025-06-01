package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Repo.InstanceRepo;
import com.example.OceanEyes.Service.InstanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InstanceServiceTest {

    @InjectMocks
    private InstanceService instanceService;

    @Mock
    private InstanceRepo instanceRepo;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveInstance_NoConflicts_Success() throws IOException {
        Instance instance = new Instance();
        instance.setDeviceName("device1");
        instance.setStartLocalDateTime(LocalDateTime.now());
        instance.setEndLocalDateTime(LocalDateTime.now().plusHours(1));

        when(instanceRepo.findConflictingInstancesByDeviceName(anyString(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(instanceRepo.save(instance)).thenReturn(instance);

        Instance savedInstance = instanceService.saveInstance(instance);

        assertNotNull(savedInstance);
        assertEquals(instance, savedInstance);
        verify(instanceRepo).save(instance);
    }

    @Test
    void testSaveInstance_WithConflicts_ReturnsNull() throws IOException {
        Instance instance = new Instance();
        instance.setDeviceName("device1");
        instance.setStartLocalDateTime(LocalDateTime.now());
        instance.setEndLocalDateTime(LocalDateTime.now().plusHours(1));

        List<Instance> conflicts = List.of(new Instance());

        when(instanceRepo.findConflictingInstancesByDeviceName(anyString(), any(), any()))
                .thenReturn(conflicts);

        Instance savedInstance = instanceService.saveInstance(instance);

        assertNull(savedInstance);
        verify(instanceRepo, never()).save(any());
    }

    @Test
    void testGetInstanceById_NotFound() {
        String id = "123";

        when(instanceRepo.findById(id)).thenReturn(Optional.empty());

        Instance result = instanceService.getInstanceById(id);

        assertNull(result);
    }

    @Test
    void testGetAllInstances() {
        List<Instance> instances = List.of(new Instance(), new Instance());

        when(instanceRepo.findAll()).thenReturn(instances);

        List<Instance> result = instanceService.getAllInstances();

        assertEquals(2, result.size());
        assertEquals(instances, result);
    }

    @Test
    void testDeleteInstanceById_Exists() {
        String id = "123";

        when(instanceRepo.existsById(id)).thenReturn(true);

        boolean deleted = instanceService.deleteInstanceById(id);

        assertTrue(deleted);
        verify(instanceRepo).deleteById(id);
    }

    @Test
    void testDeleteInstanceById_NotExists() {
        String id = "123";

        when(instanceRepo.existsById(id)).thenReturn(false);

        boolean deleted = instanceService.deleteInstanceById(id);

        assertFalse(deleted);
        verify(instanceRepo, never()).deleteById(any());
    }
}

