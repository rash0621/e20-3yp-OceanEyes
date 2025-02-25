
package com.example.OceanEyes.Service;
import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Repo.DeviceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DeviceService {


    @Autowired
    private DeviceRepo repo;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public void saveOrUpdate(Device devices) {
        repo.save(devices);
    }

//    public Device getDeviceById(String deviceId) {
//        return repo.findById(deviceId).orElse(null);
//    }

//    public Device getDeviceByName(String deviceName) {
//        return repo.findByDeviceName(deviceName).orElse(null);
//    }
//
//    public Iterable<Device> listAll() {
//        return this.repo.findAll();
//    }

    public void deleteDevice(String id) {
        repo.deleteById(id);
    }

    public Device addNewDevice(Device device) {
        boolean deviceExists = repo.findByDeviceName(device.getDeviceName()).isPresent();

        if (deviceExists) {
            throw new IllegalStateException("Name already exists");
        }
        String encodePassword = bCryptPasswordEncoder.encode(device.getDevicePassword());
        device.setDevicePassword(encodePassword);
        repo.save(device);
        return device;
    }


}
