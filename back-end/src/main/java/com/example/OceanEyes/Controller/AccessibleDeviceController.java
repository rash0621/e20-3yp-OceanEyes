
package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Entity.AccessibleDevice;
import com.example.OceanEyes.Service.AccessibleDeviceService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "*") // to connect with front-end
@RequestMapping("api/v1/accessibleDevice")
public class AccessibleDeviceController {

    @Autowired
    private AccessibleDeviceService accessibleDeviceService;

    @PostMapping(value = "/loginDevice")
    private ResponseEntity<ActionStatusMessage<String>> saveDevice(@RequestBody Device device) {
        try {
            boolean loginSuccess = accessibleDeviceService.loginNewDevice(device);
            if (loginSuccess){
                String deviceId = device.getId();
                return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Successfully logged in", deviceId));
            }
                return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL", "Invalid Credentials", null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Error in logging", null));
        }
    }

    @DeleteMapping("/delete/{id}")
    private ResponseEntity<ActionStatusMessage<String>> deleteDevice(@PathVariable(name = "id")String id) {
        try {
            accessibleDeviceService.deleteAccessibleDevice(id);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Device deleted successfully", ""));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Device deletion failed", null));
        }
    }

//    @RequestMapping("/search/{id}")
//    private Device getDevice(@PathVariable(name = "id")String id) {
//        return accessibleDeviceService.getDeviceByDeviceId(id);
//    }
//
//    @RequestMapping("/search/{name}")
//    private Device getDevice(@PathVariable(name = "name")String deviceName) {
//        return accessibleDeviceService.getAccessibleDeviceByName(deviceName);
//    }


    @GetMapping(value = "/getAll/{userId}")
    private Optional<Device> getAllDevices(@PathVariable(name = "userId")String userId) {

        return accessibleDeviceService.getDeviceByUserId(userId);
    }

    @PutMapping(value = "/edit/{id}")
    private AccessibleDevice updateDevice(@RequestBody AccessibleDevice device, @PathVariable(name = "id")String id) {

        device.setId(id);
        accessibleDeviceService.updateAccessibleDevice(device);
        return device;
    }



}
