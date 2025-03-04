package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.Service.InstanceService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/instance")
public class InstanceController {
    @Autowired
    private InstanceService instanceService;

    @PostMapping(value = "/save")
    public ResponseEntity<ActionStatusMessage<Instance>> createInstance(
            @RequestParam(value = "deviceName") String deviceName,
            @RequestParam(value = "startGpsLocation", required = false) String startGpsLocation,
            @RequestParam(value = "distanceBetweenPoints", required = false) Integer distanceBetweenPoints,
            @RequestParam(value = "map", required = false) Integer map,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "operator", required = false) String operator,
            @RequestParam(value = "locationDistrict", required = false) String locationDistrict
    ) throws IOException {
        Instance savedInstance = instanceService.saveInstance(deviceName, startGpsLocation, distanceBetweenPoints, map, description, operator, locationDistrict);

        return ResponseEntity.ok(new ActionStatusMessage<Instance> (
                "SUCCESS",
                "Device started successfully!",
                savedInstance
        ));
    }


    @GetMapping("/{id}")
    public Instance getInstance(@PathVariable String id) {
        return instanceService.getInstanceById(id);
    }

    @GetMapping("/allInstances")
    public List<Instance> getAllInstances() {
        return instanceService.getAllInstances();
    }
//    @GetMapping("/allInstances")
//     public ResponseEntity<ActionStatusMessage<List<Instance>>> getAllInstances() {
//        return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "User saved successfully", instanceService.getAllInstances()));
//
//    }
}