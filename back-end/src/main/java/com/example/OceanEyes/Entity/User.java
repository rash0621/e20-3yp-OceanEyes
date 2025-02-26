package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Collections;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String userEmail;;

    public User(String id, String userEmail) {
        this.id = id;
        this.userEmail = userEmail;
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
        this.id = id;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "User{" +
                "_id='" + id + '\'' +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}

