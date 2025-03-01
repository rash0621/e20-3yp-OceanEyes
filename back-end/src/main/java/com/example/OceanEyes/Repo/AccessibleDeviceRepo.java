
package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.AccessibleDevice;
import com.example.OceanEyes.Entity.Device;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AccessibleDeviceRepo extends MongoRepository<AccessibleDevice, String> {

//    Optional<Device> findByDeviceName(String deviceName);

    Optional<AccessibleDevice> findByUserId(String userId);
    Optional<AccessibleDevice> findByDeviceId(String deviceId);
}

