package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.TestDistance;
import com.example.OceanEyes.Service.TestDistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/v1/testDistance")
public class TestDistanceController {

    @Autowired
    private TestDistanceService testDistanceService;

    @PostMapping(value = "/save")
    public ResponseEntity<TestDistance> createTestDistance(
            @RequestParam(value = "distance", required = false) Float testDistance
    ) throws IOException {
        TestDistance savedTestDistance = testDistanceService.saveTestDistance(testDistance);
        return ResponseEntity.ok(savedTestDistance);
    }

    @GetMapping("/testDistance/{testDistanceId}")
    public ResponseEntity<List<TestDistance>> getTestDistance(@PathVariable Long testDistanceId){
        List<TestDistance> testDistance = testDistanceService.getTestDistanceById(testDistanceId);

        if (testDistance.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(testDistance);
        }
    }

    @GetMapping("/getAll")
    public List<TestDistance> getAll() {
        return testDistanceService.getAllDistances();
    }


}
