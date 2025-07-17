package com.example.OceanEyes.DTO;

public class RegisterDeviceRequest {
    private String deviceId;
    private String userId;

    // Getters and setters
    public String getDeviceId() {
        return deviceId;
    }
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
}


