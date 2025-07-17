package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String userEmail;
    private String phone;
    private String firstName;
    private String lastName;
    private String username;
    private String organization;
    private String address;
    private String userPassword;
    private String customerID;
    private int numberOfDevicePurchased;

    @DBRef
    private List<Device> loggedInDevices = new ArrayList<>();

    public User() {
    }

    public User(String id, String userEmail, String userPassword) {
        this.id = id;
        this.userEmail = userEmail;
        this.userPassword = userPassword;
    }

    public String getId() {
        return id;
    }

    public void setId(String _id) {
        this.id = _id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
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

    public String getCustomerID() {
        return customerID;
    }

    public void setCustomerID(String customerID) {
        this.customerID = customerID;
    }

    public int getNumberOfDevicePurchased() {
        return numberOfDevicePurchased;
    }

    public void setNumberOfDevicePurchased(int numberOfDevicePurchased) {
        this.numberOfDevicePurchased = numberOfDevicePurchased;
    }

    public List<Device> getLoggedInDevices() {
        return loggedInDevices;
    }

    public void setLoggedInDevice(Device loggedInDevice) {
        this.loggedInDevices.add(loggedInDevice);
    }

    public void setLoggedInDevices(List<Device> loggedInDevices) {
        this.loggedInDevices = loggedInDevices;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}
