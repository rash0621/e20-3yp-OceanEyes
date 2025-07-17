package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "devices")
public class Device {

    @Id
    private String id;
    private String deviceName;
    private String devicePassword;
    private String deviceLocation;

    public Device(String id, String deviceName, String devicePassword , String deviceLocation) {
        this.id = id;
        this.deviceName = deviceName;
        this.devicePassword = devicePassword;
        this.deviceLocation = deviceLocation;
    }

    public Device() {
    }

    public String getId() {
        return id;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getDevicePassword() {
        return devicePassword;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public void setDevicePassword(String devicePassword) {
        this.devicePassword = devicePassword;
    }
    public String getDeviceLocation() {
        return deviceLocation;
    }
    public void setDeviceLocation(String deviceLocation) {
        this.deviceLocation = deviceLocation;
    }

}

