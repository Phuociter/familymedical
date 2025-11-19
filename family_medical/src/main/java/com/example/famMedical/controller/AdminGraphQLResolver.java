package com.example.famMedical.controller;

import com.example.famMedical.Entity.*;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.service.AdminService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
public class AdminGraphQLResolver {

    private final AdminService adminService;
    private final FamilyRepository familyRepository;
    private final MemberRepository memberRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final UserRepository userRepository;
    private final DoctorRequestRepository doctorRequestRepository;
    public AdminGraphQLResolver(AdminService adminService, FamilyRepository familyRepository, 
                                MemberRepository memberRepository, DoctorAssignmentRepository doctorAssignmentRepository,
                                UserRepository userRepository, DoctorRequestRepository doctorRequestRepository) {
        this.adminService = adminService;
        this.familyRepository = familyRepository;
        this.memberRepository = memberRepository;
        this.doctorAssignmentRepository = doctorAssignmentRepository;
        this.userRepository = userRepository;
        this.doctorRequestRepository = doctorRequestRepository;
    }

    // ==================== QUERIES ====================

    @QueryMapping
    public List<Member> allMembers() {
        return adminService.listAllPatients();
    }

    @QueryMapping
    public List<User> allDoctors() {
        return adminService.listAllDoctors();
    }

    @QueryMapping
    public List<User> allUsers() {
        return adminService.listAllUsers();
    }

    @QueryMapping
    public List<Family> allFamilies() {
        return familyRepository.findAll();
    }

    @QueryMapping
    public Member memberById(@Argument Integer memberID) {
        return adminService.getPatientById(memberID);
    }

    @QueryMapping
    public User userById(@Argument Integer userID) {
        return adminService.getUserById(userID);
    }

    @QueryMapping
    public Family familyById(@Argument Integer familyID) {
        return familyRepository.findById(familyID)
                .orElseThrow(() -> new IllegalArgumentException("Family not found: " + familyID));
    }

    @QueryMapping
    public List<Payment> allPayments() {
        return adminService.listAllPayments();
    }

    @QueryMapping
    public List<Payment> paymentsByStatus(@Argument String status) {
        if (status == null || status.isEmpty()) {
            return adminService.listAllPayments();
        }
        return adminService.listPaymentsByStatus(status);
    }

    @QueryMapping
    public List<DoctorRequest> allDoctorRequests() {
        return adminService.listAllDoctorRequests();
    }

    @QueryMapping
    public List<DoctorRequest> doctorRequestsByStatus(@Argument String status) {
        if (status == null || status.isEmpty()) {
            return adminService.listAllDoctorRequests();
        }
        try {
            // Convert string status to enum (database uses Pending, Accepted, Rejected)
            DoctorRequest.RequestStatus requestStatus = DoctorRequest.RequestStatus.valueOf(status);
            return adminService.listDoctorRequestsByStatus(requestStatus);
        } catch (IllegalArgumentException e) {
            // If status is invalid, return all requests
            return adminService.listAllDoctorRequests();
        }
    }

    @QueryMapping
    public List<DoctorRequest> doctorRequestsForDoctor(@Argument Integer doctorID) {
        return doctorRequestRepository.findByDoctor_UserID(doctorID);
    }

    // ==================== FIELD RESOLVERS ====================

    /**
     * Resolver cho field familyID của Member
     * Đảm bảo trả về giá trị không null hoặc throw exception
     */
    @SchemaMapping(typeName = "Member", field = "familyID")
    @Transactional(readOnly = true)
    public Integer familyID(Member member) {
        try {
            // Nếu Family đã được load, sử dụng trực tiếp
            if (member.getFamily() != null) {
                Hibernate.initialize(member.getFamily());
                Integer familyId = member.getFamily().getFamilyID();
                if (familyId != null) {
                    return familyId;
                }
            }
            
            // Nếu Family chưa được load, reload Member với Family từ database
            Member memberWithFamily = memberRepository.findById(member.getMemberID()).orElse(null);
            if (memberWithFamily != null && memberWithFamily.getFamily() != null) {
                Integer familyId = memberWithFamily.getFamily().getFamilyID();
                if (familyId != null) {
                    return familyId;
                }
            }
            
            // Nếu vẫn không có Family, throw exception
            throw new IllegalStateException("Member " + member.getMemberID() + " has no associated family");
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            // Log lỗi và throw lại
            throw new IllegalStateException("Failed to resolve familyID for Member " + member.getMemberID() + ": " + e.getMessage(), e);
        }
    }

    /**
     * Resolver cho field gender của Member
     * Trả về giá trị enum trực tiếp từ database (Nam, Nữ, Khác)
     */
    @SchemaMapping(typeName = "Member", field = "gender")
    public String gender(Member member) {
        if (member.getGender() == null) {
            return null;
        }
        return member.getGender().name();
    }

    /**
     * Resolver cho field createdAt của Member
     * Convert LocalDateTime sang String (ISO format)
     */
    @SchemaMapping(typeName = "Member", field = "createdAt")
    public String createdAt(Member member) {
        if (member.getCreatedAt() == null) {
            return null;
        }
        return member.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Resolver cho field headOfFamilyID của Family
     * Đảm bảo trả về giá trị không null hoặc null nếu không có headOfFamily
     */
    @SchemaMapping(typeName = "Family", field = "headOfFamilyID")
    @Transactional(readOnly = true)
    public Integer headOfFamilyID(Family family) {
        try {
            if (family.getHeadOfFamily() != null) {
                Hibernate.initialize(family.getHeadOfFamily());
                return family.getHeadOfFamily().getUserID();
            }
            
            // Nếu headOfFamily chưa được load, reload Family từ database
            Family familyWithHead = familyRepository.findById(family.getFamilyID()).orElse(null);
            if (familyWithHead != null && familyWithHead.getHeadOfFamily() != null) {
                return familyWithHead.getHeadOfFamily().getUserID();
            }
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Resolver cho field familyAddress của Family
     * Map từ address field
     */
    @SchemaMapping(typeName = "Family", field = "familyAddress")
    public String familyAddress(Family family) {
        return family.getAddress();
    }

    /**
     * Resolver cho field address của Family
     * Map trực tiếp từ Entity field address
     */
    @SchemaMapping(typeName = "Family", field = "address")
    public String address(Family family) {
        return family.getAddress();
    }

    /**
     * Resolver cho field createdAt của Family
     * Convert OffsetDateTime sang String (RFC3339 format với timezone)
     */
    @SchemaMapping(typeName = "Family", field = "createdAt")
    public String createdAt(Family family) {
        if (family.getCreatedAt() == null) {
            return null;
        }
        // OffsetDateTime đã có timezone, format theo RFC3339
        return family.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    /**
     * Resolver cho field requestDate của DoctorRequest
     * Convert LocalDateTime sang String
     */
    @SchemaMapping(typeName = "DoctorRequest", field = "requestDate")
    public String requestDate(DoctorRequest doctorRequest) {
        if (doctorRequest.getRequestDate() == null) {
            return null;
        }
        return doctorRequest.getRequestDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Resolver cho field status của DoctorRequest
     * Trả về giá trị enum trực tiếp từ database (Pending, Accepted, Rejected)
     */
    @SchemaMapping(typeName = "DoctorRequest", field = "status")
    public String status(DoctorRequest doctorRequest) {
        if (doctorRequest.getStatus() == null) {
            return null;
        }
        return doctorRequest.getStatus().name();
    }

    /**
     * Resolver cho field paymentDate của Payment
     * Convert LocalDateTime sang String
     */
    @SchemaMapping(typeName = "Payment", field = "paymentDate")
    public String paymentDate(Payment payment) {
        if (payment.getPaymentDate() == null) {
            return null;
        }
        return payment.getPaymentDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Resolver cho field expiryDate của Payment
     * Convert LocalDateTime sang String
     */
    @SchemaMapping(typeName = "Payment", field = "expiryDate")
    public String expiryDate(Payment payment) {
        if (payment.getExpiryDate() == null) {
            return null;
        }
        return payment.getExpiryDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Resolver cho field createdAt của Payment
     * Convert LocalDateTime sang String
     */
    @SchemaMapping(typeName = "Payment", field = "createdAt")
    public String createdAt(Payment payment) {
        if (payment.getCreatedAt() == null) {
            return null;
        }
        return payment.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Resolver cho field updatedAt của Payment
     * Convert LocalDateTime sang String
     */
    @SchemaMapping(typeName = "Payment", field = "updatedAt")
    public String updatedAt(Payment payment) {
        if (payment.getUpdatedAt() == null) {
            return null;
        }
        return payment.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    // ==================== MUTATIONS - MEMBERS ====================

    @MutationMapping
    public Member createMember(@Argument CreateMemberInput input) {
        Family family = familyRepository.findById(input.getFamilyID())
                .orElseThrow(() -> new IllegalArgumentException("Family not found: " + input.getFamilyID()));

        Member member = new Member();
        member.setFamily(family);
        if (input.getFullName() != null) member.setFullName(input.getFullName());
        if (input.getDateOfBirth() != null) {
            member.setDateOfBirth(parseDate(input.getDateOfBirth()));
        }
        if (input.getGender() != null) {
            // Map từ GraphQL input (có thể là "Male"/"Female"/"Other" hoặc "Nam"/"Nữ"/"Khác") sang enum database
            String graphqlGender = input.getGender();
            try {
                // Thử parse trực tiếp nếu là giá trị database (Nam, Nữ, Khác)
                member.setGender(Member.Gender.valueOf(graphqlGender));
            } catch (IllegalArgumentException e) {
                // Fallback: map từ GraphQL enum (Male, Female, Other) sang database enum
                switch (graphqlGender) {
                    case "Female":
                    case "female":
                        member.setGender(Member.Gender.Nữ);
                        break;
                    case "Male":
                    case "male":
                        member.setGender(Member.Gender.Nam);
                        break;
                    case "Other":
                    case "other":
                        member.setGender(Member.Gender.Khác);
                        break;
                    default:
                        // Ignore if cannot parse
                        break;
                }
            }
        }
        if (input.getCccd() != null) member.setCccd(input.getCccd());
        if (input.getRelationship() != null) member.setRelationship(input.getRelationship());
        if (input.getPhoneNumber() != null) member.setPhoneNumber(input.getPhoneNumber());

        return adminService.createPatient(member);
    }

    @MutationMapping
    public Member updateMember(@Argument Integer memberID, @Argument UpdateMemberInput input) {
        Member member = adminService.getPatientById(memberID);
        if (input.getFullName() != null) member.setFullName(input.getFullName());
        if (input.getDateOfBirth() != null) {
            member.setDateOfBirth(parseDate(input.getDateOfBirth()));
        }
        if (input.getGender() != null) {
            // Map từ GraphQL input (có thể là "Male"/"Female"/"Other" hoặc "Nam"/"Nữ"/"Khác") sang enum database
            String graphqlGender = input.getGender();
            try {
                // Thử parse trực tiếp nếu là giá trị database (Nam, Nữ, Khác)
                member.setGender(Member.Gender.valueOf(graphqlGender));
            } catch (IllegalArgumentException e) {
                // Fallback: map từ GraphQL enum (Male, Female, Other) sang database enum
                switch (graphqlGender) {
                    case "Female":
                    case "female":
                        member.setGender(Member.Gender.Nữ);
                        break;
                    case "Male":
                    case "male":
                        member.setGender(Member.Gender.Nam);
                        break;
                    case "Other":
                    case "other":
                        member.setGender(Member.Gender.Khác);
                        break;
                    default:
                        // Ignore if cannot parse
                        break;
                }
            }   
        }
        if (input.getCccd() != null) member.setCccd(input.getCccd());
        if (input.getRelationship() != null) member.setRelationship(input.getRelationship());
        if (input.getPhoneNumber() != null) member.setPhoneNumber(input.getPhoneNumber());

        return adminService.updatePatient(memberID, member);
    }

    @MutationMapping
    public Boolean deleteMember(@Argument Integer memberID) {
        adminService.deletePatient(memberID);
        return true;
    }

    // ==================== MUTATIONS - USERS/DOCTORS ====================

    @MutationMapping
    public User createUser(@Argument CreateUserInput input) {
        User user = new User();
        user.setFullName(input.getFullName());
        user.setEmail(input.getEmail());
        user.setRole(input.getRole());
        if (input.getPhoneNumber() != null) user.setPhoneNumber(input.getPhoneNumber());
        if (input.getAddress() != null) user.setAddress(input.getAddress());
        if (input.getCccd() != null) user.setCccd(input.getCccd());
        if (input.getDoctorCode() != null) user.setDoctorCode(input.getDoctorCode());

        return adminService.createUser(user, input.getPassword());
    }

    @MutationMapping
    public User updateUser(@Argument UpdateUserInput input) {
        User user = new User();
        user.setUserID(input.getUserID());
        if (input.getFullName() != null) user.setFullName(input.getFullName());
        if (input.getPhoneNumber() != null) user.setPhoneNumber(input.getPhoneNumber());
        if (input.getAddress() != null) user.setAddress(input.getAddress());
        if (input.getCccd() != null) user.setCccd(input.getCccd());
        if (input.getDoctorCode() != null) user.setDoctorCode(input.getDoctorCode());
        if (input.getRole() != null) user.setRole(input.getRole());

        return adminService.updateUser(input.getUserID(), user);
    }

    @MutationMapping
    public Boolean deleteUser(@Argument Integer userID) {
        adminService.deleteUser(userID);
        return true;
    }

    @MutationMapping
    public User changeUserRole(@Argument Integer userID, @Argument UserRole role) {
        return adminService.changeUserRole(userID, role);
    }

    @MutationMapping
    public Boolean resetPassword(@Argument Integer userID, @Argument String newPassword) {
        adminService.resetPassword(userID, newPassword);
        return true;
    }

    @MutationMapping
    public Boolean lockUser(@Argument Integer userID) {
        adminService.lockUserAccount(userID);
        return true;
    }

    @MutationMapping
    public Boolean unlockUser(@Argument Integer userID) {
        adminService.unlockUserAccount(userID);
        return true;
    }

    // ==================== MUTATIONS - FAMILIES ====================

    @MutationMapping
    @Transactional
    public Family createFamily(@Argument CreateFamilyInput input) {
        Family family = new Family();
        family.setFamilyName(input.getFamilyName());
        if (input.getAddress() != null) family.setAddress(input.getAddress());
        if (input.getHeadOfFamilyID() != null) {
            User headOfFamily = userRepository.findById(input.getHeadOfFamilyID())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + input.getHeadOfFamilyID()));
            family.setHeadOfFamily(headOfFamily);
        }
        return familyRepository.save(family);
    }

    @MutationMapping
    public Family updateFamily(@Argument UpdateFamilyInput input) {
        Family family = familyRepository.findById(input.getFamilyID())
                .orElseThrow(() -> new IllegalArgumentException("Family not found: " + input.getFamilyID()));
        if (input.getFamilyName() != null) family.setFamilyName(input.getFamilyName());
        if (input.getAddress() != null) family.setAddress(input.getAddress());
        return familyRepository.save(family);
    }

    @MutationMapping
    public Boolean deleteFamily(@Argument Integer familyID) {
        familyRepository.deleteById(familyID);
        return true;
    }

    // ==================== MUTATIONS - DOCTOR REQUESTS ====================

    @MutationMapping
    public User approveDoctorRequest(@Argument Integer requestID) {
        return adminService.verifyDoctorRequest(requestID, true);
    }

    @MutationMapping
    public Boolean rejectDoctorRequest(@Argument Integer requestID) {
        adminService.verifyDoctorRequest(requestID, false);
        return true;
    }

    // ==================== MUTATIONS - DOCTOR ASSIGNMENT ====================

    @MutationMapping
    @Transactional
    public Boolean assignDoctorToMember(@Argument Integer memberID, @Argument Integer doctorID) {
        Member member = memberRepository.findById(memberID)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberID));
        User doctor = userRepository.findById(doctorID)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorID));

        // Đảm bảo Member có Family
        if (member.getFamily() == null) {
            throw new IllegalStateException("Member " + memberID + " has no associated family");
        }

        DoctorAssignment assignment = DoctorAssignment.builder()
                .doctor(doctor)
                .family(member.getFamily())
                .status(DoctorAssignment.AssignmentStatus.ACTIVE)
                .build();

        doctorAssignmentRepository.save(assignment);
        return true;
    }

    // ==================== INPUT CLASSES ====================

    public static class CreateMemberInput {
        private Integer familyID;
        private String fullName;
        private String dateOfBirth;
        private String gender; // Changed to String to accept GraphQL enum values
        private String cccd;
        private String relationship;
        private String phoneNumber;

        // Getters and setters
        public Integer getFamilyID() { return familyID; }
        public void setFamilyID(Integer familyID) { this.familyID = familyID; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getCccd() { return cccd; }
        public void setCccd(String cccd) { this.cccd = cccd; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class UpdateMemberInput {
        private Integer memberID;
        private String fullName;
        private String dateOfBirth;
        private String gender; // Changed to String to accept GraphQL enum values
        private String cccd;
        private String relationship;
        private String phoneNumber;

        // Getters and setters
        public Integer getMemberID() { return memberID; }
        public void setMemberID(Integer memberID) { this.memberID = memberID; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getCccd() { return cccd; }
        public void setCccd(String cccd) { this.cccd = cccd; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class CreateUserInput {
        private String fullName;
        private String email;
        private String password;
        private UserRole role;
        private String phoneNumber;
        private String address;
        private String cccd;
        private String doctorCode;

        // Getters and setters
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCccd() { return cccd; }
        public void setCccd(String cccd) { this.cccd = cccd; }
        public String getDoctorCode() { return doctorCode; }
        public void setDoctorCode(String doctorCode) { this.doctorCode = doctorCode; }
    }

    public static class UpdateUserInput {
        private Integer userID;
        private String fullName;
        private String phoneNumber;
        private String address;
        private String cccd;
        private String doctorCode;
        private UserRole role;

        // Getters and setters
        public Integer getUserID() { return userID; }
        public void setUserID(Integer userID) { this.userID = userID; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCccd() { return cccd; }
        public void setCccd(String cccd) { this.cccd = cccd; }
        public String getDoctorCode() { return doctorCode; }
        public void setDoctorCode(String doctorCode) { this.doctorCode = doctorCode; }
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
    }

    public static class CreateFamilyInput {
        private String familyName;
        private String address;
        private Integer headOfFamilyID;

        // Getters and setters
        public String getFamilyName() { return familyName; }
        public void setFamilyName(String familyName) { this.familyName = familyName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Integer getHeadOfFamilyID() { return headOfFamilyID; }
        public void setHeadOfFamilyID(Integer headOfFamilyID) { this.headOfFamilyID = headOfFamilyID; }
    }

    public static class UpdateFamilyInput {
        private Integer familyID;
        private String familyName;
        private String address;

        // Getters and setters
        public Integer getFamilyID() { return familyID; }
        public void setFamilyID(Integer familyID) { this.familyID = familyID; }
        public String getFamilyName() { return familyName; }
        public void setFamilyName(String familyName) { this.familyName = familyName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Parse date string từ nhiều format khác nhau
     * Hỗ trợ: ISO_DATE (yyyy-MM-dd), M/d/yy, M/d/yyyy, d/M/yy, d/M/yyyy
     */
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = dateString.trim();
        
        // Thử parse với ISO_DATE format trước (yyyy-MM-dd)
        try {
            return LocalDate.parse(trimmed, DateTimeFormatter.ISO_DATE);
        } catch (Exception e) {
            // Continue to try other formats
        }
        
        // Thử parse với format M/d/yy hoặc M/d/yyyy (ví dụ: 10/5/80 hoặc 10/5/1980)
        // Format: month/day/year
        try {
            if (trimmed.matches("\\d{1,2}/\\d{1,2}/\\d{2,4}")) {
                String[] parts = trimmed.split("/");
                int firstPart = Integer.parseInt(parts[0]);
                int secondPart = Integer.parseInt(parts[1]);
                int year = Integer.parseInt(parts[2]);
                
                // Nếu năm chỉ có 2 chữ số, giả định là 19xx hoặc 20xx
                if (year < 100) {
                    if (year < 50) {
                        year += 2000; // 00-49 -> 2000-2049
                    } else {
                        year += 1900; // 50-99 -> 1950-1999
                    }
                }
                
                // Phân biệt M/d và d/M: nếu phần đầu > 12 thì là d/M, ngược lại là M/d
                int month, day;
                if (firstPart > 12) {
                    // Format d/M/yy hoặc d/M/yyyy (day/month/year)
                    day = firstPart;
                    month = secondPart;
                } else {
                    // Format M/d/yy hoặc M/d/yyyy (month/day/year)
                    month = firstPart;
                    day = secondPart;
                }
                
                // Validate month và day
                if (month < 1 || month > 12) {
                    throw new IllegalArgumentException("Invalid month: " + month);
                }
                if (day < 1 || day > 31) {
                    throw new IllegalArgumentException("Invalid day: " + day);
                }
                
                return LocalDate.of(year, month, day);
            }
        } catch (Exception e) {
            // Nếu không parse được với logic trên, throw exception với message rõ ràng
            throw new IllegalArgumentException("Cannot parse date: " + dateString + ". Supported formats: yyyy-MM-dd, M/d/yy, M/d/yyyy, d/M/yy, d/M/yyyy. Error: " + e.getMessage());
        }
        
        // Nếu không match pattern, throw exception
        throw new IllegalArgumentException("Cannot parse date: " + dateString + ". Supported formats: yyyy-MM-dd, M/d/yy, M/d/yyyy, d/M/yy, d/M/yyyy");
    }
}

