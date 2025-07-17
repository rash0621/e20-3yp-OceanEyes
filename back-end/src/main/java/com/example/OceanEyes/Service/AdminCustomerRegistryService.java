package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.AdminCustomerRegistry;
import com.example.OceanEyes.Repo.AdminCustomerRegistryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminCustomerRegistryService {

    @Autowired
    private AdminCustomerRegistryRepo registryRepo;

    public AdminCustomerRegistry createRegistry(AdminCustomerRegistry registry) {
        Optional<AdminCustomerRegistry> existing = registryRepo.findByEmail(registry.getEmail());

        if (existing.isPresent()) {
            throw new IllegalArgumentException("A customer with this email already exists.");
        }
        registry.setIsRegistered(false); // Enforce false during creation
        return registryRepo.save(registry);
    }


    public void deleteRegistry(String id) {
        registryRepo.deleteById(id);
    }

    public AdminCustomerRegistry updateRegistry(AdminCustomerRegistry registry) {
        return registryRepo.save(registry);
    }

    public Optional<AdminCustomerRegistry> getByEmail(String email) {
        return registryRepo.findByEmail(email);
    }

    public Optional<AdminCustomerRegistry> getById(String id) {
        return registryRepo.findById(id);
    }

    public Optional<AdminCustomerRegistry> getByPhone(String phone) {
        return registryRepo.findByPhone(phone);
    }

    public List<AdminCustomerRegistry> getAllRegistries() {
        return registryRepo.findAll();
    }

    public String generateCustomerId() {
        int randomNum = 10000 + (int)(Math.random() * 90000);
        return "CUST-" + randomNum;
    }

    public boolean verifyCustomer(String email, String phone, String customerID) {
        return registryRepo.findByEmailAndPhoneAndId(email, phone, customerID).isPresent();
    }
}