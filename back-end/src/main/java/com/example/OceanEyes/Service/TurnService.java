package com.example.OceanEyes.Service;

import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Repo.TurnRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class TurnService {

    @Autowired
    private TurnRepo turnRepo;
    @Autowired
    private FileService fileService;

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

    public List<Turn> getTurnsByInstanceId(String instanceId) {
        return turnRepo.findByInstance_Id(instanceId);
    }
    public List<Turn> getAllTurns() {
        return turnRepo.findAll();
    }
}
