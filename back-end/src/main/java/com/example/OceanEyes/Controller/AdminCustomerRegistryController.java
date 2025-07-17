package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Entity.AdminCustomerRegistry;
import com.example.OceanEyes.Service.AdminCustomerRegistryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/admin-customer-registry")
public class AdminCustomerRegistryController {

    @Autowired
    private AdminCustomerRegistryService registryService;

    @PostMapping("/add")
    public ResponseEntity<?> addRegistry(@RequestBody AdminCustomerRegistry registry) {
        try {
            AdminCustomerRegistry saved = registryService.createRegistry(registry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add customer: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteRegistry(@PathVariable String id) {
        registryService.deleteRegistry(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<AdminCustomerRegistry> editRegistry(@PathVariable String id,
            @RequestBody AdminCustomerRegistry registry) {
        registry.setId(id);
        AdminCustomerRegistry updated = registryService.updateRegistry(registry);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/getByEmail")
    public ResponseEntity<AdminCustomerRegistry> getByEmail(@RequestParam String email) {
        Optional<AdminCustomerRegistry> registry = registryService.getByEmail(email);
        return registry.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<AdminCustomerRegistry> getById(@PathVariable String id) {
        Optional<AdminCustomerRegistry> registry = registryService.getById(id);
        return registry.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/getByPhone")
    public ResponseEntity<AdminCustomerRegistry> getByPhone(@RequestParam String phone) {
        Optional<AdminCustomerRegistry> registry = registryService.getByPhone(phone);
        return registry.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllRegistries() {
        try {
            List<AdminCustomerRegistry> list = registryService.getAllRegistries();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch customers: " + e.getMessage());
        }
    }

    @PostMapping("/generate-id")
    public ResponseEntity<?> generateCustomerId() {
        String customerId = registryService.generateCustomerId();
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("customerId", customerId));
    }

    @PostMapping("/verify-customer")
    public ResponseEntity<?> verifyCustomer(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String phone = request.get("phone");
        String customerID = request.get("customerID");

        if (email == null || phone == null || customerID == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        boolean isVerified = registryService.verifyCustomer(email, phone, customerID);

        if (isVerified) {
            return ResponseEntity.ok(Map.of("message", "Customer verified"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Customer verification failed. Check all fields."));
        }


    }
}