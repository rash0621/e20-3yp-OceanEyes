package com.example.OceanEyes.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CaptureDTO {
    private String imageUrl;
    private String turnId;
    private String angle;
    private Float distance;
    private Boolean isPollutant;
    private String pollutantType;

    public CaptureDTO(String imageUrl, String turnId,String angle, Float distance,Boolean isPollutant,String pollutantType  ) {
        this.imageUrl = imageUrl;
        this.turnId = turnId;
        this.angle = angle;
        this.distance = distance;
        this.isPollutant = isPollutant;
        this.pollutantType = pollutantType;
    }

    // Getters and Setters
}
