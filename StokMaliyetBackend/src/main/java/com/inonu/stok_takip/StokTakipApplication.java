package com.inonu.stok_takip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StokTakipApplication {

	public static void main(String[] args) {
		SpringApplication.run(StokTakipApplication.class, args);
	}

}

// http://localhost:8080/swagger-ui/index.html
// api json   http://localhost:8080/v3/api-docs

