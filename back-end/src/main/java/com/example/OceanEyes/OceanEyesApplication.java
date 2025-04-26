package com.example.OceanEyes;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class OceanEyesApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		System.setProperty("MONGODB_URI", dotenv.get("MONGODB_URI"));
		SpringApplication.run(OceanEyesApplication.class, args);
	}

}
