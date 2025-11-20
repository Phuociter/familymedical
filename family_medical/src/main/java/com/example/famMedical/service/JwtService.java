package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    // Lấy Secret Key từ application.properties/yml
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    // Thời gian hiệu lực của Token (1 ngày)
    @Value("${jwt.expiration.time.ms:86400000}")
    private long EXPIRATION_TIME;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Hàm sinh Token JWT
    public String generateToken(User user) {
        return generateToken(user, EXPIRATION_TIME);
    }

    // Overloaded method for generating token with custom expiration
    public String generateToken(User user, long expirationTime) {
        return Jwts.builder()
                .setSubject(user.getEmail()) // Tên chủ thể (email dùng để định danh)
                .claim("userId", user.getUserID())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    // Hàm xác thực Token (Cần dùng trong Filter)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Xử lý các lỗi: Token hết hạn, chữ ký không hợp lệ, v.v.
            return false;
        }
    }

    // Hàm lấy email từ Token (Cần dùng trong Filter)
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}