package com.example.OceanEyes.Entity;

import com.mongodb.lang.Nullable;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "captures")
public class Capture {
    @Id
    private String id;
    private String turnId;
    private String imageId;
    private String angle;
    private Float distance;

    public String getId() {return id;}

    public void setId(String id) {this.id = id;}

    public String getImageId() {return imageId;}

    public void setImageId(String imageId) {this.imageId = imageId;}

    public String getAngle() {return angle;}

    public void setAngle(String angle) {this.angle = angle;}

    public float getDistance() {return distance;}

    public void setDistance(float distance) {
        this.distance = distance;
    }

    public String getTurnId(){return turnId; }

    public void setTurnId(String turnId){ this.turnId = turnId; }


}
