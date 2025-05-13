package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Capture;
import com.example.OceanEyes.Entity.Instance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface CaptureRepo extends MongoRepository <Capture, String>{

    List<Capture> findCaptureByTurnId(String turnId);

}
