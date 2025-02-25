
package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*") // to connect with front-end
@RequestMapping("api/v1/device")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @PostMapping(value = "/addDevice")
    private String saveDevice(@RequestBody Device devices) {

        deviceService.saveOrUpdate(devices);
        return devices.getId();
    }

//    @GetMapping(value = "/getAll")
//    private Iterable<Device> getAllDevices() {
//
//        return deviceService.listAll();
//    }

//    @PutMapping(value = "/edit/{id}")
//    private Device updateDevice(@RequestBody Device device, @PathVariable(name = "id")String id) {
//
//        device.setId(id);
//        deviceService.saveOrUpdate(device);
//        return device;
//    }

    @DeleteMapping("/delete/{id}")
    private void deleteDevice(@PathVariable(name = "id")String id) {

        deviceService.deleteDevice(id);
    }

//    @RequestMapping("/search/{id}")
//    private Device getDevice(@PathVariable(name = "id")String id) {
//        return deviceService.getDeviceById(id);
//    }

//    @RequestMapping("/search/{name}")
//    private Device getDevice(@PathVariable(name = "name")String deviceName) {
//        return deviceService.getDeviceByName(deviceName);
//    }



}
