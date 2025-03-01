package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Repo.InstanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class InstanceService {
    @Autowired
    private InstanceRepo instanceRepo;

    public Instance saveInstance(String deviceName, String startGpsLocation, int distanceBetweenPoints, int map) throws IOException {
        Instance instance = new Instance();
        instance.setDeviceName(deviceName);
        instance.setStartGpsLocation(startGpsLocation);
        instance.setDistanceBetweenPoints(distanceBetweenPoints);
        instance.setMap(map);

        return instanceRepo.save(instance);
    }

    public Instance getInstanceById(String instanceId) {
        return instanceRepo.findById(instanceId).orElse(null);
    }

    public List<Instance> getAllInstances() {
        return instanceRepo.findAll();
    }
}
