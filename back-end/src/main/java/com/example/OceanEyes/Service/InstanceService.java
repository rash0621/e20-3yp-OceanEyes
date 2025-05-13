package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Repo.InstanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class InstanceService {
    @Autowired
    private InstanceRepo instanceRepo;

    public Instance saveInstance(Instance instance) throws IOException {

        String deviceName = instance.getDeviceName();
        LocalDateTime start = instance.getStartLocalDateTime();
        LocalDateTime end = instance.getEndLocalDateTime();
        List<Instance> conflicts = instanceRepo.findConflictingInstancesByDeviceName(deviceName, start, end);

        if (!conflicts.isEmpty()) {
            return null;
        }
        return instanceRepo.save(instance);
    }

    public Instance getInstanceById(String instanceId) {
        return instanceRepo.findById(instanceId).orElse(null);
    }

    public List<Instance> getAllInstances() {
        return instanceRepo.findAll();
    }

    public boolean deleteInstanceById(String id) {
        if (instanceRepo.existsById(id)) {
            instanceRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
