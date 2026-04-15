package com.SyncClinic.payment_service.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
 
@Configuration
public class StripeConfig {
 
    @Value("${stripe.api.key}")
    private String stripeApiKey;
 
    // Runs once when the app starts — sets the global Stripe API key
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }
}
 