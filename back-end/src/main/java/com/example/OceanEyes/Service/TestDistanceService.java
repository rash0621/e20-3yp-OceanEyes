package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.TestDistance;
import com.example.OceanEyes.Repo.TestDistanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class TestDistanceService {

    @Autowired
    private TestDistanceRepo testDistanceRepo;

    public TestDistance saveTestDistance(float testDistance) throws IOException {
        TestDistance testDistance1 = new TestDistance();
        testDistance1.setDistance(testDistance);

        return testDistanceRepo.save(testDistance1);
    }

    public List<TestDistance> getTestDistanceById(float testDistanceId){
        return testDistanceRepo.findTestDistanceById(testDistanceId);
    }

    public List<TestDistance> getAllDistances() {
        return testDistanceRepo.findAll();
    }
}
