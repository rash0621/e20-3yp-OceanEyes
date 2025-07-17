package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.AdminCustomerRegistry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminCustomerRegistryRepo extends MongoRepository<AdminCustomerRegistry, String> {
    Optional<AdminCustomerRegistry> findByEmail(String email);

    Optional<AdminCustomerRegistry> findByPhone(String phone);
    Optional<AdminCustomerRegistry> findByEmailAndPhoneAndId(String email, String phone, String id);
}