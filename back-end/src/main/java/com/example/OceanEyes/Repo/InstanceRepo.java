package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Instance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface InstanceRepo extends MongoRepository<Instance, String> {

    @Query("{ $and: [ { 'deviceName': ?0 }, { 'endDateTime': { $gt: ?1 } }, { 'startDateTime': { $lt: ?2 } } ] }")
    List<Instance> findConflictingInstancesByDeviceName(String deviceName, LocalDateTime start, LocalDateTime end);

}
