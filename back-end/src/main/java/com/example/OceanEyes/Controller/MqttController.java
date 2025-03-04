package com.example.OceanEyes.Controller;

import com.example.OceanEyes.Service.MqttService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mqtt")
public class MqttController {

    private final MqttService mqttService;

    public MqttController(MqttService mqttService) {
        this.mqttService = mqttService;
    }

    @PostMapping("/publish")
    public String publishMessage(@RequestParam String topic, @RequestParam String message) {
        mqttService.sendMessage(topic, message);
        return "Message sent to topic: " + topic;
    }

    @GetMapping("/subscribe")
    public String subscribeToTopic(@RequestParam String topic) {
        mqttService.receiveMessages(topic);
        return "Subscribed to topic: " + topic;
    }
}
