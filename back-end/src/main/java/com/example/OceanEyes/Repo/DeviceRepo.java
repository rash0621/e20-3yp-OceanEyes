
package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Device;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DeviceRepo extends MongoRepository<Device, String> {

    Optional<Device> findByDeviceName(String deviceName);
}
