package com.example.famMedical.service;

import com.example.famMedical.Entity.User;
import com.example.famMedical.Entity.UserRole;
import com.example.famMedical.exception.UserAlreadyExistsException;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.MemberRepository;
import com.example.famMedical.repository.UserRepository;
import com.example.famMedical.repository.MedicalRecordRepository;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.PaymentRepository;
import com.example.famMedical.Entity.Member;
import com.example.famMedical.Entity.MedicalRecord;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.Payment;
import com.example.famMedical.Entity.Family;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRequestRepository doctorRequestRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(MemberRepository memberRepository, UserRepository userRepository, FamilyRepository familyRepository, PasswordEncoder passwordEncoder, MedicalRecordRepository medicalRecordRepository, DoctorRequestRepository doctorRequestRepository, PaymentRepository paymentRepository) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.passwordEncoder = passwordEncoder;
        this.medicalRecordRepository = medicalRecordRepository;
        this.doctorRequestRepository = doctorRequestRepository;
        this.paymentRepository = paymentRepository;
    }

    /**
     * List all users
     */
    public List<User> listAllUsers() {
        return userRepository.findAll();
    }

    /**
     * List all patients (members)
     */
    @Transactional(readOnly = true)
    public List<Member> listAllPatients() {
        return memberRepository.findAllWithFamily();
    }

    public Member getPatientById(Integer id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id: " + id));
    }

    @Transactional
    public Member createPatient(Member member) {
        return memberRepository.save(member);
    }

    @Transactional
    public Member updatePatient(Integer id, Member updated) {
        Member existing = getPatientById(id);
        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        if (updated.getPhoneNumber() != null) existing.setPhoneNumber(updated.getPhoneNumber());
        if (updated.getDateOfBirth() != null) existing.setDateOfBirth(updated.getDateOfBirth());
        if (updated.getGender() != null) existing.setGender(updated.getGender());
        if (updated.getCccd() != null) existing.setCccd(updated.getCccd());
        if (updated.getRelationship() != null) existing.setRelationship(updated.getRelationship());
        return memberRepository.save(existing);
    }

    @Transactional
    public void deletePatient(Integer id) {
        memberRepository.deleteById(id);
    }

    public List<MedicalRecord> getMedicalRecordsForPatient(Integer memberId) {
        Member member = getPatientById(memberId);
        return medicalRecordRepository.findByMember_MemberID(memberId);
    }

    public void lockUserAccount(Integer userId) {
        User user = getUserById(userId);
        user.setLocked(true);
        userRepository.save(user);
    }

    public void unlockUserAccount(Integer userId) {
        User user = getUserById(userId);
        user.setLocked(false);
        userRepository.save(user);
    }

    /**
     * Return a simple map of YearMonth (yyyy-MM) to count of new patients created in that month.
     */
    public java.util.Map<String, Long> countNewPatientsPerMonth() {
        java.util.List<Member> members = memberRepository.findAll();
        java.util.Map<String, Long> map = new java.util.HashMap<>();
        for (Member m : members) {
            java.time.LocalDateTime dt = m.getCreatedAt();
            String key = dt.getYear() + "-" + String.format("%02d", dt.getMonthValue());
            map.put(key, map.getOrDefault(key, 0L) + 1);
        }
        return map;
    }

    // ------------------ Doctor management ------------------

    public List<User> listAllDoctors() {
        return userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.BacSi).toList();
    }

    @Transactional
    public User verifyDoctorRequest(Integer requestId, boolean approve) {
        DoctorRequest req = doctorRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor request not found: " + requestId));
        if (approve) {
            req.setStatus(DoctorRequest.RequestStatus.Accepted);
            User doctor = req.getDoctor();
            doctor.setVerified(true);
            userRepository.save(doctor);
        } else {
            req.setStatus(DoctorRequest.RequestStatus.Rejected);
        }
        // Lưu thay đổi status của DoctorRequest
        doctorRequestRepository.save(req);
        return req.getDoctor();
    }

    /**
     * Get a single user by id
     */
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    /**
     * Create a new user (admin-created). Caller should provide a raw password that will be encoded.
     */
    @Transactional
    public User createUser(User user, String rawPassword) {
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException(user.getEmail());
        }

        if (rawPassword != null) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
        }

        return userRepository.save(user);
    }

    /**
     * Update certain user fields. Does not change password unless explicitly using resetPassword.
     */
    @Transactional
    public User updateUser(Integer id, User updated) {
        User existing = getUserById(id);

        // update allowed fields
        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        if (updated.getPhoneNumber() != null) existing.setPhoneNumber(updated.getPhoneNumber());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getCccd() != null) existing.setCccd(updated.getCccd());
        if (updated.getDoctorCode() != null) existing.setDoctorCode(updated.getDoctorCode());
        if (updated.getRole() != null) existing.setRole(updated.getRole());

        return userRepository.save(existing);
    }

    @Transactional
    public void deleteUser(Integer id) {
        // Consider removing or reassigning related families/members if business rules require it.
        userRepository.deleteById(id);
    }

    @Transactional
    public User changeUserRole(Integer id, UserRole role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User resetPassword(Integer id, String newRawPassword) {
        User user = getUserById(id);
        user.setPasswordHash(passwordEncoder.encode(newRawPassword));
        return userRepository.save(user);
    }

    // ------------------ Doctor Request management ------------------

    public List<DoctorRequest> listAllDoctorRequests() {
        return doctorRequestRepository.findAllWithRelations();
    }

    public List<DoctorRequest> listDoctorRequestsByStatus(DoctorRequest.RequestStatus status) {
        return doctorRequestRepository.findByStatus(status);
    }

    public DoctorRequest getDoctorRequestById(Integer id) {
        return doctorRequestRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor request not found: " + id));
    }

    // ------------------ Payment management ------------------

    public List<Payment> listAllPayments() {
        // Sử dụng query với join fetch để load đầy đủ relationships
        return paymentRepository.findAllWithUser();
    }

    public List<Payment> listPaymentsByStatus(String status) {
        // Sử dụng query với join fetch để load đầy đủ relationships
        return paymentRepository.findByPaymentStatus(Payment.PaymentStatus.valueOf(status));      
    }

    @Transactional
    public Payment updatePayment(Integer id, Payment updated) {
        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + id));
        return paymentRepository.save(updated);
    }

}
