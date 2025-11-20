package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.exception.InvalidCredentialsException; // Import mới
import com.example.famMedical.exception.UserAlreadyExistsException; // Import mới
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;



    public AuthService(UserRepository userRepository, FamilyRepository familyRepository, MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public Optional<User> authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                return Optional.of(user);
            }
        }
        return Optional.empty(); // Trả về rỗng để Resolver ném InvalidCredentialsException
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }



    @Transactional
    public User registerFamily(String fullName, String email, String password, String familyName, String phoneNumber, String address, String cccd) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Họ và Tên không được để trống.");
        }
        if (userRepository.existsByEmail(email)) {
            // SỬA: Dùng UserAlreadyExistsException
            throw new UserAlreadyExistsException(email);
        }

        // 1. Tạo User (Chủ hộ)
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserRole.ChuHo);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setCccd(cccd);

        User savedUser = userRepository.save(user);

        // 2. Tạo Family
        Family family = new Family();
        family.setFamilyName(familyName);
        family.setAddress(address);
        family.setHeadOfFamily(savedUser);
        Family savedFamily = familyRepository.save(family);

        // 3. TẠO MEMBER CHO CHỦ HỘ (Đảm bảo có hồ sơ cá nhân)
        Member headMember = new Member();
        headMember.setFamily(savedFamily);
        headMember.setFullName(savedUser.getFullName());
        headMember.setPhoneNumber(savedUser.getPhoneNumber());
        headMember.setCccd(savedUser.getCccd());
        headMember.setRelationship("Chủ hộ");

        memberRepository.save(headMember);

        return savedUser;
    }



    public User registerDoctor(String fullName, String email, String password, String doctorCode, String phoneNumber, String address, String cccd, String hospitalName, String yearsOfExperience) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Họ và Tên không được để trống.");
        }
        if (userRepository.existsByEmail(email)) {
            // SỬA: Dùng UserAlreadyExistsException
            throw new UserAlreadyExistsException(email);
        }
        if (userRepository.existsByDoctorCode(doctorCode)) {
            // SỬA: Dùng UserAlreadyExistsException
            throw new UserAlreadyExistsException(doctorCode, "Mã bác sĩ");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(UserRole.BacSi);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setCccd(cccd);
        user.setDoctorCode(doctorCode);
        user.setHospitalName(hospitalName);
        user.setYearsOfExperience(yearsOfExperience);

        return userRepository.save(user);
    }

    @Transactional
    public User processOAuth2User(String provider, org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
        String id;
        java.util.Optional<User> userOptional = java.util.Optional.empty();

        if (provider.equalsIgnoreCase("google")) {
            id = oauth2User.getAttribute("sub");
            userOptional = userRepository.findByGoogleId(id);
        } else if (provider.equalsIgnoreCase("facebook")) {
            id = oauth2User.getAttribute("id");
            userOptional = userRepository.findByFacebookId(id);
        }

        if (userOptional.isPresent()) {
            return userOptional.get(); // Returning OAuth user
        }

        // OAuth user not found by provider id, let's check by email for linking
        String email = oauth2User.getAttribute("email");
        java.util.Optional<User> userByEmail = userRepository.findByEmail(email);

        if (userByEmail.isPresent()) {
            // Local user exists, link their account
            User user = userByEmail.get();
            if (provider.equalsIgnoreCase("google")) {
                id = oauth2User.getAttribute("sub");
                user.setGoogleId(id);
            } else if (provider.equalsIgnoreCase("facebook")) {
                id = oauth2User.getAttribute("id");
                user.setFacebookId(id);
            }
            return userRepository.save(user);
        }

        // Brand new user
        User newUser = new User();
        String emailNew = oauth2User.getAttribute("email");

        newUser.setEmail(emailNew);
        newUser.setFullName(oauth2User.getAttribute("name"));
        newUser.setRole(UserRole.ChuHo); // Default role
        newUser.setProfileComplete(false); // Mark as incomplete for new OAuth users

        if (provider.equalsIgnoreCase("google")) {
            id = oauth2User.getAttribute("sub");
            newUser.setGoogleId(id);
        } else if (provider.equalsIgnoreCase("facebook")) {
            id = oauth2User.getAttribute("id");
            newUser.setFacebookId(id);
        }

        // Generate and set a random password
        String randomPassword = java.util.UUID.randomUUID().toString();
        newUser.setPasswordHash(passwordEncoder.encode(randomPassword));

        // As discussed, this new user is incomplete and will need to complete their profile later.

        return userRepository.save(newUser);
    }

    @Transactional
    public User completeOAuth2FamilyRegistration(Integer userId, String familyName, String phoneNumber, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (user.isProfileComplete()) {
            throw new IllegalStateException("User profile is already complete.");
        }

        // Update user's phone number and address if provided
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setProfileComplete(true); // Mark profile as complete

        User savedUser = userRepository.save(user);

        // 2. Tạo Family
        Family family = new Family();
        family.setFamilyName(familyName);
        family.setAddress(address);
        family.setHeadOfFamily(savedUser);
        Family savedFamily = familyRepository.save(family);

        // 3. TẠO MEMBER CHO CHỦ HỘ (Đảm bảo có hồ sơ cá nhân)
        Member headMember = new Member();
        headMember.setFamily(savedFamily);
        headMember.setFullName(savedUser.getFullName());
        headMember.setPhoneNumber(savedUser.getPhoneNumber());
        headMember.setCccd(savedUser.getCccd()); // CCCD might be null if not collected during OAuth
        headMember.setRelationship("Chủ hộ");

        memberRepository.save(headMember);

        return savedUser;
    }
    @Transactional
    public User updateUserProfile(Integer userId, String fullName, String phoneNumber, String cccd, String avatarUrl, String address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));  

        user.setFullName(fullName);
        user.setPhoneNumber(phoneNumber);
        user.setCccd(cccd);
        user.setAvatarUrl(avatarUrl);
        user.setAddress(address);

        return userRepository.save(user);
    }

}
