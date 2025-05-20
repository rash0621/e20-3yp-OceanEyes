package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Service.CaptureService;
import com.example.OceanEyes.Service.FileService;
import com.example.OceanEyes.StatusMessages.ActionStatusMessage;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/capture")
public class CaptureController {

    @Autowired
    private CaptureService captureService;
    @Autowired
    private FileService fileService;


    @GetMapping("/images/turn/{turnId}")
    public ResponseEntity<ActionStatusMessage<List<String>>> getImageUrlsByTurnId(@PathVariable String turnId) {
        List<Capture> captures = captureService.getCapturesByTurnId(turnId);
        List<String> imageUrls = new ArrayList<>();

        for (Capture capture : captures) {
            String imageId = capture.getImageId();
            imageUrls.add("capture/images/file/" + imageId);
        }

        return ResponseEntity.ok(new ActionStatusMessage<>("SUCCESS", "Retrieved image URLs successfully", imageUrls));
    }

    @GetMapping("/images/file/{imageId}")
    public ResponseEntity<?> getImageById(@PathVariable String imageId) {
        Optional<GridFsResource> resource = fileService.getFile(imageId);
        if (resource.isPresent()) {
            try {
                return ResponseEntity
                        .ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(new InputStreamResource(resource.get().getInputStream()));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reading image");
            }
        }
        return ResponseEntity.notFound().build();
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
