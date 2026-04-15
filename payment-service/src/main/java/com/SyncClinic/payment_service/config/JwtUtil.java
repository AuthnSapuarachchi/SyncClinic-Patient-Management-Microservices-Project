package com.SyncClinic.payment_service.config;

 
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
 
import java.security.Key;
 
@Component
public class JwtUtil {
 
    @Value("${jwt.secret}")
    private String secret;
 
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
 
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
 
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
 
    public String extractUserId(String token) {
        return extractAllClaims(token).get("userId", String.class);
    }
 
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
 
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}