package com.example.OceanEyes.Entity;

import com.mongodb.lang.Nullable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "instances")
public class Instance {
    @Id
    private String id;
    @Nullable
    private String deviceName;
    @Nullable
    private String startGpsLocation;
    @Nullable
    private Integer distanceBetweenPoints;
    @Nullable
    private Integer map;
    @Nullable
    private LocalDateTime localDateTime;
    @Nullable
    private String description;
    @Nullable
    private String operator;
    @Nullable
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

    public Integer getDistanceBetweenPoints() {
        return distanceBetweenPoints;
    }

    public void setDistanceBetweenPoints(Integer distanceBetweenPoints) {
        this.distanceBetweenPoints = distanceBetweenPoints;
    }

    public Integer getMap() {
        return map;
    }

    public void setMap(Integer map) {
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
