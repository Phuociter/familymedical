package com.example.famMedical.repository;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.famMedical.Entity.Member;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByFacebookId(String facebookId);
    boolean existsByEmail(String email);
    boolean existsByDoctorCode(String doctorCode);
    List<User> findByRole(UserRole Role); // Kiểm tra trùng lặp DoctorCode
    // List<Member> findByMemberFamilyFamilyID(Integer familyID);
}