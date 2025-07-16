package com.example.OceanEyes.Controller;
import com.example.OceanEyes.Service.InstanceService;
import org.springframework.mock.web.MockMultipartFile;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.TurnService;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
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
    private InstanceService instanceService;
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
                        if (info.length == 3) {
                            try {
                                //01_90deg_5.6.jpg -> turnNo_angle_distance
                                //isPollutant,pollutantType -> by the python module
                                int turnNumber = Integer.parseInt(info[0]); // for later use
                                String angle = info[1];
                                float distance = Float.parseFloat(info[2].split("\\.")[0]);
                                boolean isPollutant = false;
                                String pollutantType = null;
                                //call to flask app determine the pollutants and change the capturedImage image
                                RestTemplate restTemplate = new RestTemplate();

                                HttpHeaders headers = new HttpHeaders();
                                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                                body.add("image", new ByteArrayResource(capturedImage.getBytes()) {
                                    @Override
                                    public String getFilename() {
                                        return capturedImage.getOriginalFilename();
                                    }
                                });

                                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                                String flaskUrl = "http://localhost:5000/analyze";
                                ResponseEntity<byte[]> response = restTemplate.exchange(flaskUrl, HttpMethod.POST, requestEntity, byte[].class);

                                // Extract metadata from headers
                                String isPollutantHeader = response.getHeaders().getFirst("X-IsPollutant");
                                String pollutantTypeHeader = response.getHeaders().getFirst("X-PollutantType");

                                isPollutant = Boolean.parseBoolean(isPollutantHeader);
                                pollutantType = pollutantTypeHeader != null && !pollutantTypeHeader.equals("None") ? pollutantTypeHeader : null;

                                // Convert annotated image to MultipartFile
                                String originalFilename = capturedImage.getOriginalFilename();
                                MockMultipartFile annotatedImage = new MockMultipartFile(
                                        "capturedImages",
                                        "annotated_" + originalFilename,
                                        "image/jpeg",
                                        response.getBody()
                                );
                                captureService.saveCapture(savedTurnId, annotatedImage, angle, distance,isPollutant,pollutantType);

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

    @PostMapping(value = "/save_old")
    public ResponseEntity<ActionStatusMessage<Turn>> createTurn_old(
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
                        if (info.length >= 4) {
                            try {
                                //01_90deg_5.6_True_Metal.jpg -> turnNo_angle_distance_isPollutant_pollutantType
                                int turnNumber = Integer.parseInt(info[0]); // for later use
                                String angle = info[1];
                                float distance = Float.parseFloat(info[2]);
                                boolean isPollutant = Boolean.parseBoolean(info[3]);
                                String pollutantType = null;
                                if (isPollutant && info.length >= 5) {
                                    pollutantType = info[4].split("\\.")[0]; // Remove .jpg
                                }
                                captureService.saveCapture(savedTurnId, capturedImage, angle, distance,isPollutant,pollutantType);

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

//    public ResponseEntity<ActionStatusMessage<Iterable<Turn>>> getTurnsByInstanceId(@PathVariable String instanceId) {
//        try{
//            List<Turn> turns = turnService.getTurnsByInstanceId(instanceId);
//            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Retrieved info successfully", turns));
//        }catch(Exception e){
//            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Retrieving info failed", null));
//        }
//
//    }

    @PostMapping(value = "/getTurnsByInstanceName")
    public ResponseEntity<ActionStatusMessage<Iterable<Turn>>> getTurnsByInstanceName(@PathVariable String instanceId) {
        try{
            List<Turn> turns = turnService.getTurnsByInstanceName(instanceId);
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Retrieved info successfully", turns));
        }catch(Exception e){
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Retrieving info failed", null));
        }

    }

    @PostMapping(value = "/getTurnByInstanceName")
    public ResponseEntity<ActionStatusMessage<Turn>> getATurnByInstanceName(@PathVariable String instanceId) {
        try{
            List<Turn> turns = turnService.getTurnsByInstanceName(instanceId);
            Turn turn = turns.getFirst();
            return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Retrieved info successfully", turn));
        }catch(Exception e){
            return ResponseEntity.status(500).body(new ActionStatusMessage<>("FAIL", "Retrieving info failed", null));
        }

    }

    @GetMapping("/allTurns")
    public List<Turn> getAllTurns() {
        return turnService.getAllTurns();
    }

    @GetMapping("/getLatestTurns")
    public List<Turn> getLastTurnPerInstanceIdByDateTime(){return turnService.getLastTurnPerInstanceIdByDateTime();}

}
