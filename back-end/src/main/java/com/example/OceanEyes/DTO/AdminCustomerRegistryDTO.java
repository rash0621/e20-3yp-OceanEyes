package com.example.OceanEyes.DTO;

public class AdminCustomerRegistryDTO {
    private String name;
    private String email;
    private String phone;
    private String organization;
    private String address;
    private int numberOfDevicePurchased;
    private boolean isRegistered;
    private String customerId;

    // Getters and setters
    public AdminCustomerRegistryDTO() {

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

}
