package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.sql.Timestamp;

@Document(collection = "admin_customer_registry")
public class AdminCustomerRegistry {

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    private String organization;
    private String address;
    private Boolean isRegistered;
    private int numberOfDevicePurchased;
    private String custormerID;

    public AdminCustomerRegistry() {
    }

    public AdminCustomerRegistry(String id, String name, String email, String phone, String organization,
            String address,
            boolean isRegistered, int numberOfDevicePurchased, String custormerID) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.organization = organization;
        this.address = address;
        this.isRegistered = isRegistered;
        this.numberOfDevicePurchased = numberOfDevicePurchased;
        this.custormerID = custormerID;
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

    public void setIsRegistered(boolean registered) {
        isRegistered = registered;
    }


    public int getNumberOfDevicePurchased() {
        return numberOfDevicePurchased;
    }

    public void setNumberOfDevicePurchased(int numberOfDevicePurchased) {
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }

    public String getCustormerID() {
        return custormerID;
    }
    public void setCustormerID(String custormerID) {
        this.custormerID = custormerID;
    }
}