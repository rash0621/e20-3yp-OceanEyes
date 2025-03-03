package com.example.OceanEyes.Entity;


import com.mongodb.lang.Nullable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "testDistance")
public class TestDistance {

    @Id
    private String id;

    @Nullable
    private float distance;

    public float getDistance() {
        return distance;
    }

    public void setDistance(float distance) {
        this.distance = distance;
    }
}
