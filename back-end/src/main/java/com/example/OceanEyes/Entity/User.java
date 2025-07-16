package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String userEmail;;
    private String userPassword;
    private String firstName;
    private String lastName;
    private String username;
    @DBRef
    private List<Device> loggedInDevices = new ArrayList<>();

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public User(String id, String userEmail, String userPassword) {
        this.id = id;
        this.userEmail = userEmail;
        this.userPassword = userPassword;
    }

    public User() {
    }

    public String getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setId(String _id) {
        this.id = _id;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<Device> getLoggedInDevices() {
        return loggedInDevices;
    }

    public void setLoggedInDevice(Device loggedInDevice) {
        this.loggedInDevices.add(loggedInDevice);
    }

    @Override
    public String toString() {
        return "User{" +
                "_id='" + id + '\'' +
                ", userEmail='" + userEmail + '\'' +
                '}';
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
}
