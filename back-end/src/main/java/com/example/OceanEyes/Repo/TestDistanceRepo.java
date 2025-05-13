package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.TestDistance;
import org.springframework.data.geo.Distance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TestDistanceRepo extends MongoRepository<TestDistance, String> {
    List<TestDistance> findTestDistanceById(double testDistanceId);
}
