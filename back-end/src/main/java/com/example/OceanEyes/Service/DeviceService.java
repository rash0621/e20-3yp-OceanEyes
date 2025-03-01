
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
    private DeviceRepo deviceRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void saveOrUpdate(Device devices) {
        deviceRepository.save(devices);
    }


    public void deleteDevice(String id) {
        deviceRepository.deleteById(id);
    }

    public boolean addNewDevice(Device device) {
        boolean deviceExists = deviceRepository.findByDeviceName(device.getDeviceName()).isPresent();

        if (deviceExists) {
            throw new IllegalStateException("Name already exists");
        }
        try {
            String encodePassword = passwordEncoder.encode(device.getDevicePassword());
            device.setDevicePassword(encodePassword);
            deviceRepository.save(device);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    public boolean loginNewDevice(Device device) {

        Optional<Device> optionalDevice = deviceRepository.findByDeviceName(device.getDeviceName());
        boolean deviceExists = optionalDevice.isPresent();

        if (deviceExists) {
            Device dbDevice = optionalDevice.get();
            return passwordEncoder.matches(device.getDevicePassword(), dbDevice.getDevicePassword());
        } else {
            throw new RuntimeException("Device not found");

        }
    }
}
