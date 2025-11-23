package com.example.famMedical.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails; // Cần thiết
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import lombok.ToString;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userID;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;

    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "PasswordHash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false)
    private UserRole role;

    @Column(name = "PhoneNumber", length = 20)
    private String phoneNumber;

    @Column(name = "Address", length = 255)
    private String address;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(name = "avatarUrl", length = 255)
    private String avatarUrl;

    @Column(name = "DoctorCode", length = 20)
    private String doctorCode;

    @Column(name = "GoogleID", length = 255)
    private String googleId;

    @Column(name = "FacebookID", length = 255, nullable = true)
    private String facebookId;

    @Column(name = "HospitalName" ,nullable = true, length = 255)
    private String HospitalName; 
    
    @Column(name = "yearsOfExperience", nullable = true, length = 255)
    private String yearsOfExperience;

    @Column(name = "IsProfileComplete", nullable = false)
    private boolean isProfileComplete = true;

    @Column(name = "IsLocked", nullable = false)
    private boolean isLocked = false;

    @Column(name = "IsVerified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }


    @Override
    public String getPassword() {
        return passwordHash;
    }


    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}