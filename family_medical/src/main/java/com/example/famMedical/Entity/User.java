package com.example.famMedical.Entity;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="Users")
@NoArgsConstructor
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer userID;
  private String fullName;
  private String email;
  private String passwordHash;
  @Enumerated(EnumType.STRING)
  private Role role; // CHUHO, BACSI, ADMIN
  private String phoneNumber;
  private String cccd;
  private String doctorCode;
  // getters/setters

  public enum Role {
    CHUHO,     // Chủ hộ gia đình
    BACSI,     // Bác sĩ gia đình
    ADMIN      // Quản trị viên hệ thống
}

  public Integer getUserID() {
    return userID;
  }

  public void setUserID(Integer userID) {
    this.userID = userID;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public Role getRole() {
    return role;
  }
}



