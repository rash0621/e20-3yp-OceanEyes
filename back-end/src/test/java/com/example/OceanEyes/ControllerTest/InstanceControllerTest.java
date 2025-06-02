package com.example.OceanEyes.ControllerTest;

import com.example.OceanEyes.Controller.InstanceController;
import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.InstanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InstanceControllerTest {

    @Mock
    private InstanceService instanceService;

    @InjectMocks
    private InstanceController instanceController;

    private Instance instance1;
    private Instance instance2;

    @BeforeEach
    void setUp() {
        instance1 = new Instance();
        instance2 = new Instance();
    }

    @Test
    void testGetAllInstances() {
        List<Instance> instances = Arrays.asList(instance1, instance2);
        when(instanceService.getAllInstances()).thenReturn(instances);

        List<Instance> result = instanceController.getAllInstances();

        assertEquals(2, result.size());
        verify(instanceService, times(1)).getAllInstances();
    }

    @Test
    void testGetInstanceById() {
        String instanceId = "123";
        when(instanceService.getInstanceById(instanceId)).thenReturn(instance1);

        Instance result = instanceController.getInstance(instanceId);

        assertEquals(instance1, result);
        verify(instanceService, times(1)).getInstanceById(instanceId);
    }
}

