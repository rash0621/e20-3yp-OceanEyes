package com.example.OceanEyes.ServiceTest;

import com.example.OceanEyes.Service.MqttService;
import org.junit.jupiter.api.Test;

class MqttServiceTest {
    @Test
    void testSendMessage() {
        MqttService mqttService = new MqttService();
        mqttService.sendMessage("test/topic", "Hello MQTT");
    }
}

