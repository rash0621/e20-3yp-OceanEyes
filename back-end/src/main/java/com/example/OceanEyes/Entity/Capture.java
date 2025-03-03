package com.example.OceanEyes.Entity;

import com.mongodb.lang.Nullable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "captures")
public class Capture {
    @Id
    private String id;

    @DBRef
    private Instance instance;


    @Nullable
    private String imageId;
    @Nullable
    private String direction;
    @Nullable
    private Float distance;
    @Nullable
    private String gpsLocation;

    public byte[] getImageId() {
        return imageId.getBytes();
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public Instance getInstance() {
        return instance;
    }

    public void setInstance(Instance instance) {
        this.instance = instance;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public float getDistance() {
        return distance;
    }

    public void setDistance(float distance) {
        this.distance = distance;
    }

    public String getGpsLocation() {
        return gpsLocation;
    }

    public void setGpsLocation(String gpsLocation) {
        this.gpsLocation = gpsLocation;
    }
}
