
package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Collections;
import java.util.Date;

@Document(collection = "accessibleDevices")
public class AccessibleDevice {

    @Id
    private String id;
    private String userId;
    private String deviceId;
    private Date loginTime;

    public AccessibleDevice(String id, String userId, String deviceId, Date loginTime) {
        this.id = id;
        this.userId = userId;
        this.deviceId = deviceId;
        this.loginTime = loginTime;
    }

    public AccessibleDevice() {
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public void setLoginTime(Date loginTime) {
        this.loginTime = loginTime;
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public Date getLoginTime() {
        return loginTime;
    }

}




