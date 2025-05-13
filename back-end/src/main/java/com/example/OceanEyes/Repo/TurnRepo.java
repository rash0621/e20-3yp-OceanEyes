package com.example.OceanEyes.Repo;

import com.example.OceanEyes.Entity.Turn;
import com.example.OceanEyes.Entity.Instance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TurnRepo extends MongoRepository <Turn, String>{
    List<Turn> findTurnById(String turnId);

    List<Turn> findByInstance(Instance instance);

    List<Turn> findByInstance_Id(String instanceId);
}
