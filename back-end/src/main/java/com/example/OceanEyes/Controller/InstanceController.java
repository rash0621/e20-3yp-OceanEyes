package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.Service.InstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

 @RestController
@RequestMapping("/api/v1/instance")
public class InstanceController {
    @Autowired
    private InstanceService instanceService;

    @PostMapping(value = "/save")
    public ResponseEntity<Instance> createInstance(
            @RequestParam("deviceName") String deviceName,
            @RequestParam("startGpsLocation") String startGpsLocation,
            @RequestParam("distanceBetweenPoints") int distanceBetweenPoints,
            @RequestParam("map") int map,
            @RequestParam("description") String description,
            @RequestParam("operator") String operator,
            @RequestParam("locationDistrict") String locationDistrict
    ) throws IOException {
        Instance savedInstance = instanceService.saveInstance(deviceName, startGpsLocation, distanceBetweenPoints, map, description, operator, locationDistrict);
        return ResponseEntity.ok(savedInstance);
    }


    @GetMapping("/{id}")
    public Instance getInstance(@PathVariable String id) {
        return instanceService.getInstanceById(id);
    }

    @GetMapping("/allInstances")
    public List<Instance> getAllInstances() {
        return instanceService.getAllInstances();
    }
}