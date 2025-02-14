package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepo extends MongoRepository<User, String> {

}
