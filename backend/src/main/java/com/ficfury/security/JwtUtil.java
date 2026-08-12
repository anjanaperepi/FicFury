package com.ficfury.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // ==========================
    // Generate JWT
    // ==========================

    public String generateToken(UserDetails userDetails) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role",
                userDetails.getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority());

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpiration
                        )
                )
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // ==========================
    // Username
    // ==========================

    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // ==========================
    // Expiration
    // ==========================

    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    // ==========================
    // Generic Claim
    // ==========================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        Claims claims = extractAllClaims(token);

        return resolver.apply(claims);
    }

    // ==========================
    // Parse Token
    // ==========================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ==========================
    // Expired?
    // ==========================

    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    // ==========================
    // Validate
    // ==========================

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {

        String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }
}
