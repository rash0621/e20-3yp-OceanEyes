package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Entity.Instance;
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

    public Capture saveCapture(String turnId,MultipartFile file, String angle, Float distance) throws IOException {

        String imageId = fileService.saveFile(file);
        if(imageId!=null){
            Capture capture = new Capture();
            capture.setTurnId(turnId);
            capture.setImageId(imageId);
            capture.setAngle(angle);
            capture.setDistance(distance);
            return captureRepo.save(capture);
        }else{
            throw new IOException("Failed to save image file. imageId is null.");
        }
    }

    public List<Capture> getCapturesByTurnId(String turnId) {
        return captureRepo.findCaptureByTurnId(turnId);
    }
    public List<Capture> getAllCaptures() {
        return captureRepo.findAll();
    }
}
