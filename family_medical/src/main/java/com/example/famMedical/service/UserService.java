package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> takeDoctorList() {
        return userRepository.findByRole(UserRole.BacSi);
    }
}
