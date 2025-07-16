package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.Service.InstanceService;
import com.example.OceanEyes.Service.MqttService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/instance")
public class InstanceController {
    @Autowired
    private InstanceService instanceService;
    @Autowired
    private MqttService mqttService;

    @PostMapping(value = "/create")
    public ResponseEntity<ActionStatusMessage<Instance>> createInstance(
            @RequestParam(value = "deviceName") String deviceName,
            @RequestParam(value = "startDateTime") LocalDateTime startDateTime,
            @RequestParam(value = "endDateTime", required = false) LocalDateTime endDateTime,
            @RequestParam(value = "timeBetweenTurns") Integer timeBetweenTurns,
            @RequestParam(value = "locationDistrict", required = false) String locationDistrict,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "mqttTopic") String mqttTopic
            ) {

        try {

            Instance instance = new Instance();
            instance.setDeviceName(deviceName);
            instance.setStartLocalDateTime(startDateTime);
            instance.setEndLocalDateTime(endDateTime);
            instance.setTimeBetweenCaptures(timeBetweenTurns);
            instance.setDescription(description);
            instance.setLocationDistrict(locationDistrict);

            Instance savedInstance = instanceService.saveInstance(instance);

            if (savedInstance== null) {
                return ResponseEntity.status(401).body(new ActionStatusMessage<Instance>("FAIL", "Conflicting instances exists!", null));
            }

            // Build MQTT payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("instanceId", savedInstance.getInstanceId());  // Ensure this returns a string like "OceanEyes_20240602_001"
            payload.put("startDateTime", startDateTime.toString());
            payload.put("endDateTime", endDateTime != null ? endDateTime.toString() : null);
            payload.put("timeBetweenTurns", timeBetweenTurns);

            // Convert to JSON
            String jsonMessage = new ObjectMapper().writeValueAsString(payload);

            // Send to MQTT
            mqttService.sendMessage(mqttTopic, jsonMessage);
            return ResponseEntity.ok(new ActionStatusMessage<Instance>("SUCCESS", "Instance created and published successfully!", savedInstance));
        } catch (IOException e) {

            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL",e.getMessage(), null));
        }
    }


    @GetMapping("/{id}")
    public Instance getInstance(@PathVariable String id) {
        return instanceService.getInstanceById(id);
    }

    @GetMapping("/allInstances")
    public List<Instance> getAllInstances() {
        return instanceService.getAllInstances();
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<ActionStatusMessage<String>> deleteInstanceById(@PathVariable String id){
        if (instanceService.deleteInstanceById(id)) {
            return ResponseEntity.ok(new ActionStatusMessage<String>("SUCCESS","Deleted successfully",""));
        } else {
            return ResponseEntity.status(401).body(new ActionStatusMessage<>("FAIL","Deletion failed", "No instance exists with the given id"));        }

    }

}