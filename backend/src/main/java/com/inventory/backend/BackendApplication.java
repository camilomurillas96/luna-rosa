package com.inventory.backend;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner generadorDeHash(PasswordEncoder passwordEncoder) {
		return args -> {
			System.out.println("======================================================");
			//System.out.println("HASH GENERADO PARA 'admin123':");
			//System.out.println(passwordEncoder.encode("admin123"));
			System.out.println("======================================================");
		};
	}
}