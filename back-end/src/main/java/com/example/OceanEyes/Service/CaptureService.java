package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Repo.CaptureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class CaptureService {

    @Autowired
    private CaptureRepo captureRepo;
    @Autowired
    private FileService fileService;

    public Capture saveCapture(MultipartFile file, String direction, Float distance, String gpsLocation) throws IOException {
        String imageId = fileService.saveFile(file);

        Capture capture = new Capture();
        capture.setImageId(imageId);
        capture.setDirection(direction);
        capture.setDistance(distance);
        capture.setGpsLocation(gpsLocation);

        return captureRepo.save(capture);
    }

    public List<Capture> getCapturesById(String captureId) {
        return captureRepo.findCaptureById(captureId);
    }
}
