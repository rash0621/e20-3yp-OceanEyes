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

    public String getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setId(String _id) {
        this.id = id;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<Device> getLoggedInDevices() {return loggedInDevices;}

    public void setLoggedInDevices(Device loggedInDevice) {this.loggedInDevices.add(loggedInDevice);}

    @Override
    public String toString() {
        return "User{" +
                "_id='" + id + '\'' +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}

