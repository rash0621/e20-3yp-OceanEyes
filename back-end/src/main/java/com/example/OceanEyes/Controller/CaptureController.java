package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.FileService;
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
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/capture")
public class CaptureController {

    @Autowired
    private CaptureService captureService;
    @Autowired
    private FileService fileService;

    @PostMapping(value = "/save")
    public ResponseEntity<Capture> createCapture(
            @RequestParam(value = "image", required = false) MultipartFile file,
            @RequestParam(value = "direction", required = false) String direction,
            @RequestParam(value = "distance", required = false) Integer distance,
            @RequestParam(value = "gpsLocation", required = false) String gpsLocation
    ) throws IOException {
        Capture savedCapture = captureService.saveCapture(file, direction, distance, gpsLocation);
        return ResponseEntity.ok(savedCapture);
    }

    @GetMapping("/image/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable String imageId) {
        Optional<GridFsResource> file = fileService.getFile(imageId);

        return file.map(resource -> {
            try (InputStream inputStream = resource.getInputStream();
                 ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {

                byte[] buffer = new byte[1024];
                int length;
                while ((length = inputStream.read(buffer)) != -1) {
                    byteArrayOutputStream.write(buffer, 0, length);
                }

                byte[] fileContent = byteArrayOutputStream.toByteArray();

                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(fileContent);

            } catch (IOException e) {
                return ResponseEntity.status(500).body(new byte[0]);  //
            }
        }).orElseGet(() -> ResponseEntity.status(404).body(new byte[0]));  //
    }


}
