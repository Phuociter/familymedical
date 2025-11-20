package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.exception.UserNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> takeDoctorList() {
        return userRepository.findByRole(UserRole.BacSi);
    }

    // New method for forgot password
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found."));

        // Generate a 4-digit code
        Random random = new Random();
        String resetCode = String.format("%04d", random.nextInt(10000)); // Ensures 4 digits, e.g., 0007

        // Set code and expiry (e.g., 10 minutes from now)
        user.setPasswordResetCode(resetCode);
        user.setResetCodeExpiry(LocalDateTime.now().plusMinutes(10)); // Code valid for 10 minutes
        userRepository.save(user);

        // Send email
        String subject = "Mã đặt lại mật khẩu của bạn";
        String text = "Mã đặt lại mật khẩu của bạn là: " + resetCode + "\nMã này sẽ hết hạn sau 10 phút.";
        emailService.sendSimpleMessage(email, subject, text);

        return "Mã đặt lại mật khẩu đã được gửi đến email của bạn.";
    }

    public String validateResetCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found."));

        if (user.getPasswordResetCode() == null || !user.getPasswordResetCode().equals(code)) {
            throw new RuntimeException("Mã xác thực không đúng.");
        }

        if (user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn.");
        }

        // Generate a temporary token valid for 10 minutes (600,000 ms)
        String tempToken = jwtService.generateToken(user, 600000);

        // Clear the reset code to prevent reuse
        user.setPasswordResetCode(null);
        user.setResetCodeExpiry(null);
        userRepository.save(user);

        return tempToken;
    }

    public String resetMyPassword(String token, String newPassword) {
        if (!jwtService.validateToken(token)) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn.");
        }

        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for token."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Đổi mật khẩu thành công.";
    }
}
