package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "instances")
public class Instance {
    @Id
    private String id;
    private String deviceName;
    private String startGpsLocation;
    private int distanceBetweenPoints;
    private int map;

    public String getInstanceId() {
        return id;
    }

    public void setInstanceId(String instanceId) {
        this.id = instanceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getStartGpsLocation() {
        return startGpsLocation;
    }

    public void setStartGpsLocation(String startGpsLocation) {
        this.startGpsLocation = startGpsLocation;
    }

    public int getDistanceBetweenPoints() {
        return distanceBetweenPoints;
    }

    public void setDistanceBetweenPoints(int distanceBetweenPoints) {
        this.distanceBetweenPoints = distanceBetweenPoints;
    }

    public int getMap() {
        return map;
    }

    public void setMap(int map) {
        this.map = map;
    }
}
