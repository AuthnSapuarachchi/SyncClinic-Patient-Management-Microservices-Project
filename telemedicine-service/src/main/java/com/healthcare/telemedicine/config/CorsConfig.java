package com.healthcare.telemedicine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration is now handled centrally by the API Gateway.
 * This class is kept for reference but is NOT enabled as a Spring Configuration.
 * The gateway at port 8080 handles CORS for the frontend (http://localhost:5173),
 * while the telemedicine service receives requests only from the gateway internally.
 */
public class CorsConfig implements WebMvcConfigurer {

	// Configuration removed - handled by API Gateway instead

}

