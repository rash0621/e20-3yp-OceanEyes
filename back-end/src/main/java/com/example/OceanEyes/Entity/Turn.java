package com.example.OceanEyes.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Document(collection = "turns")
public class Turn {
    @Id
    private String id;
    private String instanceId;
    private LocalDate date;
    private LocalTime time;
    private Float gpsLocationLongitude;
    private Float gpsLocationLatitude;


    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getInstanceId() {return instanceId;}

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {this.date = date;}

    public LocalTime getTime(){return time;}

    public void setTime(LocalTime time){ this.time = time;}

    public Float getGpsLocationLongitude(){return gpsLocationLongitude;}

    public void setGpsLocationLongitude(Float gpsLocationLongitude){this.gpsLocationLongitude = gpsLocationLongitude;}

    public Float getGpsLocationLatitude(){return  gpsLocationLatitude;}

    public void setGpsLocationLatitude(Float gpsLocationLatitude){this.gpsLocationLatitude = gpsLocationLatitude;}

}
