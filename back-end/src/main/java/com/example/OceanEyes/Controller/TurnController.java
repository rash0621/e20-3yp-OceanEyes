package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.TurnService;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/turn")
public class TurnController {

    @Autowired
    private TurnService turnService;
    @Autowired
    private CaptureService captureService;


    @PostMapping(value = "/save")
    public ResponseEntity<ActionStatusMessage<Turn>> createTurn(
            @RequestParam(value = "instanceId") String instanceId,
            @RequestParam(value = "date") LocalDate date,
            @RequestParam(value = "time") LocalTime time,
            @RequestParam(value = "gpsLocationLongitude", required = false) Float gpsLocationLongitude,
            @RequestParam(value = "gpsLocationLatitude", required = false) Float gpsLocationLatitude,
            @RequestParam(value = "capturedImages", required = false) MultipartFile[] capturedImages

    ){

        try {
            Turn savedTurn = turnService.saveTurn(instanceId, date, time, gpsLocationLongitude, gpsLocationLatitude);
            String savedTurnId = savedTurn.getId();
            if (capturedImages != null) {
                for (MultipartFile capturedImage : capturedImages) {
                    String filename = capturedImage.getOriginalFilename();
                    if (filename != null) {
                        String[] info = filename.split("[_]");
                        if (info.length >= 3) {
                            try {
                                //01_90deg_5.6.jpg -> turnNo_angle_distance
                                int turnNumber = Integer.parseInt(info[0]); // for later use
                                String angle = info[1];
                                float distance = Float.parseFloat(info[2]);
                                captureService.saveCapture(savedTurnId, capturedImage, angle, distance);

                            } catch (NumberFormatException e) {
                                System.err.println("Filename format invalid: " + filename);
                                return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL",e.getMessage(), null));

                            }
                        }
                    }
                }
            }
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Saved info successfully", savedTurn));
        }catch (Exception e){
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL",e.getMessage(), null));

        }
    }

    public ResponseEntity<ActionStatusMessage<Iterable<Turn>>> getTurnsByInstanceId(@PathVariable String instanceId) {
        try{
            List<Turn> turns = turnService.getTurnsByInstanceId(instanceId);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Retrieved info successfully", turns));
        }catch(Exception e){
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Retrieving info failed", null));
        }

    }

    @GetMapping("/allTurns")
    public List<Turn> getAllTurns() {
        return turnService.getAllTurns();
    }

}
