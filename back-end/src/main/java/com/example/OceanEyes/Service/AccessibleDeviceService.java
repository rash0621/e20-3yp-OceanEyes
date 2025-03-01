package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Repo.DeviceRepo;
import com.example.OceanEyes.Entity.AccessibleDevice;
import com.example.OceanEyes.Repo.AccessibleDeviceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AccessibleDeviceService {

    @Autowired
    private AccessibleDeviceRepo accessibleDeviceRepository;
    @Autowired
    private DeviceRepo deviceRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    public Optional<Device> getDeviceByDeviceId(String deviceId) {
        Optional<AccessibleDevice> accessibleDevice = accessibleDeviceRepository.findByDeviceId(deviceId);
        return accessibleDevice.flatMap(dl -> deviceRepository.findById(dl.getDeviceId()));
    }

    public Optional<Device> getDeviceByUserId(String userId) {
        Optional<AccessibleDevice> accessibleDevice = accessibleDeviceRepository.findByUserId(userId);
        return accessibleDevice.flatMap(dl -> deviceRepository.findById(dl.getDeviceId()));
    }

    public void deleteAccessibleDevice(String id) {
        accessibleDeviceRepository.deleteById(id);
    }

    public void updateAccessibleDevice(AccessibleDevice device) {
        accessibleDeviceRepository.save(device);
    }

    public boolean loginNewDevice(Device device) {

        Optional<Device> optionalDevice = deviceRepository.findByDeviceName(device.getDeviceName());
        boolean deviceExists = optionalDevice.isPresent();

        if (deviceExists) {
            Device loginRequestDevice = optionalDevice.get();
            return passwordEncoder.matches(device.getDevicePassword(), loginRequestDevice.getDevicePassword());
        } else {
            throw new RuntimeException("Device not found");
        }
    }



}
