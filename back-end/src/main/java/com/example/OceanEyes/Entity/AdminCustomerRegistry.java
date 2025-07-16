package com.example.OceanEyes.Entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotNull;
import java.sql.Timestamp;
import java.time.Instant;

@Document(collection = "admin_customer_registry")
public class AdminCustomerRegistry {

    @Id
    private String id;

    @NotNull
    private String name;

    @NotNull
    @Email
    private String email;

    @NotNull
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @NotNull
    private String organization;
    private String address;

    @NotNull
    private boolean isRegistered;

    private int numberOfDevicePurchased;

    public AdminCustomerRegistry() {
    }

    public AdminCustomerRegistry(String id, String name, String email, String phone, String organization,
            String address,
            boolean isRegistered, Timestamp createdAt, int numberOfDevicePurchased) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.organization = organization;
        this.address = address;
        this.isRegistered = isRegistered;
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isRegistered() {
        return isRegistered;
    }

    public void setRegistered(boolean registered) {
        isRegistered = registered;
    }


    public int getNumberOfDevicePurchased() {
        return numberOfDevicePurchased;
    }

    public void setNumberOfDevicePurchased(int numberOfDevicePurchased) {
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }
}