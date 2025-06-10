package com.suicide.codeConnect_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CodeConnectApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CodeConnectApiApplication.class, args);
	}

}