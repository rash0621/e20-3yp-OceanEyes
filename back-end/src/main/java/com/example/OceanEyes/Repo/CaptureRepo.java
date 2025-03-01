package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Capture;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CaptureRepo extends MongoRepository <Capture, String>{
    List<Capture> findCaptureById(String captureId);
}
