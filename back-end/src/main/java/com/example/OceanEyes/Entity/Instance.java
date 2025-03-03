package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "instances")
public class Instance {
    @Id
    private String id;
    private String deviceName;
    private String startGpsLocation;
    private int distanceBetweenPoints;
    private int map;
    private LocalDateTime localDateTime;
    private String description;
    private String operator;
    private String locationDistrict;

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

    public LocalDateTime getLocalDateTime() {
        return localDateTime;
    }

    public void setLocalDateTime(LocalDateTime localDateTime) {
        this.localDateTime = localDateTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getLocationDistrict() {
        return locationDistrict;
    }

    public void setLocationDistrict(String locationDistrict) {
        this.locationDistrict = locationDistrict;
    }
}
