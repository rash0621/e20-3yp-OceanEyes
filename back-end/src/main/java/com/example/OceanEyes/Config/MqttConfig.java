package com.example.OceanEyes.Config;

import software.amazon.awssdk.crt.CRT;
import software.amazon.awssdk.crt.mqtt.*;
import software.amazon.awssdk.iot.AwsIotMqttConnectionBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public class MqttConfig {
    private static final String CLIENT_ID = "oceaneyes-backend";
    private static final String IOT_ENDPOINT = "a1kvbsby5hify1-ats.iot.ap-south-1.amazonaws.com"; // Replace with your endpoint
    private static final String CERTIFICATE_PATH = "src/main/resources/certs/device.pem.crt";
    private static final String PRIVATE_KEY_PATH = "src/main/resources/certs/private.pem.key";
    private static final String CA_PATH = "src/main/resources/certs/AmazonRootCA1.pem";

    private MqttClientConnection connection;

    public void connect() {
        try {
            AwsIotMqttConnectionBuilder builder = AwsIotMqttConnectionBuilder.newMtlsBuilderFromPath(CERTIFICATE_PATH, PRIVATE_KEY_PATH);
            builder.withCertificateAuthorityFromPath(null, CA_PATH)
                    .withEndpoint(IOT_ENDPOINT)
                    .withClientId(CLIENT_ID)
                    .withCleanSession(true)
                    .withProtocolOperationTimeoutMs(60000);

            connection = builder.build();
            builder.close();

            CompletableFuture<Boolean> connected = connection.connect();
            connected.get();
            System.out.println("Connected to AWS IoT Core");

        } catch (Exception e) {
            System.err.println("MQTT Connection Failed: " + e.getMessage());
        }
    }

    public void publish(String topic, String message) {
        if (connection != null) {
            CompletableFuture<Integer> publish = connection.publish(
                    new MqttMessage(topic, message.getBytes(StandardCharsets.UTF_8), QualityOfService.AT_LEAST_ONCE, false)
            );
            publish.join();
            System.out.println("Published: " + message);
        }
    }

    public void subscribe(String topic) {
        if (connection != null) {
            connection.subscribe(topic, QualityOfService.AT_LEAST_ONCE, (message) -> {
                String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
                System.out.println("Received: " + payload);
            }).join();
            System.out.println("Subscribed to topic: " + topic);
        }
    }

    public void disconnect() {
        if (connection != null) {
            connection.disconnect().join();
            connection.close();
            System.out.println("Disconnected from AWS IoT Core");
        }
    }
}
