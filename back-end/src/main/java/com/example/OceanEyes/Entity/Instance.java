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
    private String instanceName;
    private String deviceName;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer timeBetweenTurns;
    @Nullable
    private String locationDistrict;
    @Nullable
    private String description;

    public String getInstanceId() {
        return id;
    }

    public void setInstanceId(String instanceId) {
        this.id = instanceId;
    }

    public String getInstanceName() {return instanceName;}

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public LocalDateTime getStartLocalDateTime() {
        return startDateTime;
    }

    public void setStartLocalDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndLocalDateTime() {return endDateTime;}

    public void setEndLocalDateTime(LocalDateTime endDateTime) {this.endDateTime = endDateTime;}

    @Nullable
    public String getDescription() {
        return description;
    }

    public void setDescription(@Nullable String description) {
        this.description = description;
    }

    @Nullable
    public String getLocationDistrict() {
        return locationDistrict;
    }

    public void setLocationDistrict(@Nullable String locationDistrict) {
        this.locationDistrict = locationDistrict;
    }

    public Integer getTimeBetweenCaptures() {return timeBetweenTurns;}

    public void setTimeBetweenCaptures(Integer timeBetweenTurns) {this.timeBetweenTurns = timeBetweenTurns;}
}
