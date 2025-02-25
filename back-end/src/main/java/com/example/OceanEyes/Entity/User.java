package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Collections;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String username;;

    public User(String id, String username) {
        this.id = id;
        this.username = username;
    }

    public User() {
    }

    public String getId() {
        return id;
    }

    public String getUserName() {
        return username;
    }

    public void setId(String _id) {
        this.id = id;
    }

    public void setUserName(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "User{" +
                "_id='" + id + '\'' +
                ", username='" + username + '\'' +
                '}';
    }
}

