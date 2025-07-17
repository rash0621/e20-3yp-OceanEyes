package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admin_customer_registry")
public class AdminCustomerRegistry {

    @Id
    private String id;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String username;
    private String organization;
    private String address;
    private Boolean isRegistered;
    private int numberOfDevicePurchased;

    public AdminCustomerRegistry() {
    }

    public AdminCustomerRegistry(String id, String email, String phone, String firstName, String lastName,
                                 String username, String organization, String address, Boolean isRegistered,
                                 int numberOfDevicePurchased) {
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.organization = organization;
        this.address = address;
        this.isRegistered = isRegistered;
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public Boolean getIsRegistered() {
        return isRegistered;
    }

    public void setIsRegistered(Boolean isRegistered) {
        this.isRegistered = isRegistered;
    }

    public int getNumberOfDevicePurchased() {
        return numberOfDevicePurchased;
    }

    public void setNumberOfDevicePurchased(int numberOfDevicePurchased) {
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }

}
