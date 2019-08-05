package xyz.cofe.eurekasample;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaSampleApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaSampleApplication.class, args);
	}

}
