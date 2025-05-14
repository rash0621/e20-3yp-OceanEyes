
package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Config.JwtUtil;
import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Service.DeviceService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/v1/device")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping(value = "/add")
    private ResponseEntity<ActionStatusMessage<String>> saveDevice(@RequestBody Device device) {
        try {
            boolean deviceSaved = deviceService.addNewDevice(device);

            if (deviceSaved){
                String deviceId = device.getId();
                String token = jwtUtil.generateToken(deviceId);
                return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Device created successfully", token));
            }
            else return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Device creation failed", null));

        }catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Name already exists", null));
        }
    }

    @DeleteMapping("/delete/{id}")
    private ResponseEntity<ActionStatusMessage<String>> deleteDevice(@PathVariable(name = "id")String id) {
        try {
            deviceService.deleteDevice(id);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Device deleted successfully", ""));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Device deletion failed", null));
        }
    }

    @PostMapping(value = "/loginDevice")
    private ResponseEntity<ActionStatusMessage<String>> loginDevice(@RequestBody Device device) {
        try {
            boolean loginSuccess = deviceService.loginNewDevice(device);
            if (loginSuccess){
                String deviceId = device.getId();
                String token = jwtUtil.generateToken(deviceId);
                return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Successfully logged in", token));
            }
            return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL", "Invalid Credentials", null));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Error in logging", null));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<String> startDevice() {
        String piUrl = "https://4f1b-192-248-41-84.ngrok-free.app/start-device"; // ngrok URL

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("instanceId", "OCE123");
        payload.put("start", true);
        payload.put("timestamp", System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForEntity(piUrl, request, String.class);
            return ResponseEntity.ok("Command sent");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopDevice() {
        String piUrl = "https://4f1b-192-248-41-84.ngrok-free.app/stop-device"; // ngrok URL

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("instanceId", "OCE123");
        payload.put("stop", true);
        payload.put("timestamp", System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForEntity(piUrl, request, String.class);
            return ResponseEntity.ok("Stop command sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

}
