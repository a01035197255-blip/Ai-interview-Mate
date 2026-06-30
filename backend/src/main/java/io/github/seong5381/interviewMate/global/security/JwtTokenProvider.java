package io.github.seong5381.interviewMate.global.security;

import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {
    private final SecretKey secretKey;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.access-expiration}") long accessExpMs,
            @Value("${jwt.refresh-expiration}") long refreshExpMs) {

        this.secretKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.accessExpMs = accessExpMs;
        this.refreshExpMs = refreshExpMs;
    }

    public String createAccessToken(String email, String role) {
        return Jwts.builder()
                .subject(email).claim("role", role)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + accessExpMs))
                .signWith(secretKey)
                .compact();
    }

    public String createRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpMs))
                .signWith(secretKey)
                .compact();
    }

    public String getEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public void validate(String token) {
        try {
            parseClaims(token);
        } catch (ExpiredJwtException e) {
            throw new AuthException(ErrorCode.TOKEN_EXPIRED, ErrorCode.TOKEN_EXPIRED.getStatus());
        } catch (JwtException | IllegalArgumentException e) {
            throw new AuthException(ErrorCode.TOKEN_INVALID, ErrorCode.TOKEN_INVALID.getStatus());
        }
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public long getRemainingMs(String token) {
        return parseClaims(token).getExpiration().getTime() - System.currentTimeMillis();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload();
    }
}
