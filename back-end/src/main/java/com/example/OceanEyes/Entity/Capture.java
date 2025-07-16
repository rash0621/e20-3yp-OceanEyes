package com.example.OceanEyes.Entity;

import com.mongodb.lang.Nullable;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "captures")
@Getter
@Setter
public class Capture {
    @Id
    private String id;
    private String turnId;
    private String imageId;
    private String angle;
    private Float distance;
    private Boolean isPollutant;
    private String pollutantType;


}
