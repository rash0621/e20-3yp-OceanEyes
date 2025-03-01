package com.example.OceanEyes.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import jakarta.annotation.PostConstruct;

@Configuration
public class MongoConfig {

    private final MongoTemplate mongoTemplate;

    public MongoConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps("accessibleDevices");
        indexOps.ensureIndex(
                new Index().on("loginTime", org.springframework.data.domain.Sort.Direction.ASC)
                        .expire(2592000) // 30 days (30 * 24 * 60 * 60)
        );
    }
}
