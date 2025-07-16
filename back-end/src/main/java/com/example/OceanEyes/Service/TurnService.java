package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Instance;
import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Repo.TurnRepo;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurnService {

    @Autowired
    private TurnRepo turnRepo;
    @Autowired
    private FileService fileService;
    @Autowired
    private MongoTemplate mongoTemplate;

    public Turn saveTurn(String instanceId, LocalDate date, LocalTime time,Float gpsLocationLongitude,Float gpsLocationLatitude) throws IOException {

        Turn turn = new Turn();
        turn.setInstanceId(instanceId);
        turn.setDate(date);
        turn.setTime(time);
        turn.setGpsLocationLongitude(gpsLocationLongitude);
        turn.setGpsLocationLatitude(gpsLocationLatitude);
        return turnRepo.save(turn);
    }

    public List<Turn> getTurnsById(String turnId) {
        return turnRepo.findTurnById(turnId);
    }

//    public List<Turn> getTurnsByInstanceId(String instanceId) {
//        return turnRepo.findByInstanceId(instanceId);
//    }
    public List<Turn> getTurnsByInstanceName(String instanceName) {
        return turnRepo.findByInstanceId(instanceName);
    }
    public List<Turn> getAllTurns() {
        return turnRepo.findAll();
    }

    public List<Turn> getLastTurnPerInstanceIdByDateTime() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "date", "time")),
                Aggregation.group("instanceId")
                        .first(Aggregation.ROOT).as("latest"),
                Aggregation.project("latest")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "turns", Document.class);

        return results.getMappedResults().stream()
                .map(doc -> mongoTemplate.getConverter().read(Turn.class, (Document) doc.get("latest")))
                .collect(Collectors.toList());
    }



}
