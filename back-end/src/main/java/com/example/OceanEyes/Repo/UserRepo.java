package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Device;
import com.example.OceanEyes.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepo extends MongoRepository<User, String> {

    Optional<User> findByUserEmail(String userEmail);

}
