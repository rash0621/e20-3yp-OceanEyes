package com.example.OceanEyes.Config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "WtlbpE260VUViBikrHQ0mfbrxrFmzyL9oz9uL7yKNK4=";   //Base64
    SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET_KEY));

    public String generateToken(String id) {
        System.out.println("Generating token for ID: " + id); // debug
        return Jwts.builder()
                .setSubject(id) // Store User ID in token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiry
                .signWith(key, SignatureAlgorithm.HS256) // Explicitly set algorithm
                .compact();
    }

    public String extractUserId(String token) {
        try {
            String subject = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            if (subject == null) {
                throw new RuntimeException("JWT subject (user ID) is null");
            }

            return subject;
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired JWT token: " + e.getMessage());
        }
    }


    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
