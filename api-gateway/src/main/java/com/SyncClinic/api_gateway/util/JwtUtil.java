package com.SyncClinic.api_gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;

@Component
public class JwtUtil {

    // This is a secret key used to digitally sign the tokens.
    // In a real production app, NEVER hardcode this. It should be in an environment variable.
    // This string must be at least 256 bits (32 characters) long.
    @Value("${jwt.secret:5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437}")
    private String secret;

    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
