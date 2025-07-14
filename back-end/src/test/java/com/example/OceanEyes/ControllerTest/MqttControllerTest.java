package com.example.OceanEyes.ControllerTest;

import com.example.OceanEyes.Controller.MqttController;
import com.example.OceanEyes.Service.MqttService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

import static org.assertj.core.api.Assertions.assertThat;

public class MqttControllerTest {

    private MqttService mqttService;
    private MqttController mqttController;

    @BeforeEach
    public void setUp() {
        mqttService = mock(MqttService.class);
        mqttController = new MqttController(mqttService);
    }

    @Test
    public void testPublishMessage() {
        // Arrange
        String topic = "sensor/data";
        String message = "temperature:25";

        // Act
        String response = mqttController.publishMessage(topic, message);

        // Assert
        verify(mqttService, times(1)).sendMessage(topic, message);
        assertThat(response).isEqualTo("Message sent to topic: " + topic);
    }

    @Test
    public void testSubscribeToTopic() {
        // Arrange
        String topic = "sensor/data";

        // Act
        String response = mqttController.subscribeToTopic(topic);

        // Assert
        verify(mqttService, times(1)).receiveMessages(topic);
        assertThat(response).isEqualTo("Subscribed to topic: " + topic);
    }
}
