package com.example.doit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DoitApplication {

	public static void main(String[] args) {
		SpringApplication.run(DoitApplication.class, args);
	}

}
