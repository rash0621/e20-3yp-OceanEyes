package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Instance;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InstanceRepo extends MongoRepository<Instance, String> {
}
