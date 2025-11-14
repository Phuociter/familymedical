package com.example.famMedical.controller;

import com.example.famMedical.Entity.*;
import com.example.famMedical.repository.*;
import com.example.famMedical.service.AdminService;
import com.example.famMedical.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminRestController {

    private final AdminService adminService;
    private final MemberRepository memberRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final CloudinaryService cloudinaryService;
    private final DoctorRequestRepository doctorRequestRepository;
    private final PaymentRepository paymentRepository;

    public AdminRestController(AdminService adminService,
                               MemberRepository memberRepository,
                               FamilyRepository familyRepository,
                               UserRepository userRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               DoctorAssignmentRepository doctorAssignmentRepository,
                               CloudinaryService cloudinaryService,
                               DoctorRequestRepository doctorRequestRepository,
                               PaymentRepository paymentRepository) {
        this.adminService = adminService;
        this.memberRepository = memberRepository;
        this.familyRepository = familyRepository;
        this.userRepository = userRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.doctorAssignmentRepository = doctorAssignmentRepository;
        this.cloudinaryService = cloudinaryService;
        this.doctorRequestRepository = doctorRequestRepository;
        this.paymentRepository = paymentRepository;
    }

    // ---------------- Members (patients) ----------------

    @GetMapping("/members")
    public List<Member> listMembers() {
        return adminService.listAllPatients();
    }

    @PostMapping("/members")
    public ResponseEntity<Member> createMember(@RequestParam Integer familyId) {
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new IllegalArgumentException("Family not found: " + familyId));
        Member m = new Member();
        m.setFamily(family);
        m.setCreatedAt(LocalDateTime.now());
        Member saved = adminService.createPatient(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/members/{id}")
    public Member updateMember(@PathVariable Integer id, @RequestBody Member updated) {
        return adminService.updatePatient(id, updated);
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Integer id) {
        adminService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // @PostMapping("/members/{memberId}/upload")
    // public ResponseEntity<?> uploadFiles(@PathVariable Integer memberId, @RequestParam("files") MultipartFile[] files) {
    //     if (files == null || files.length == 0) {
    //         return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
    //     }

    //     Member member = memberRepository.findById(memberId)
    //             .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

    //     List<String> uploadedUrls = new java.util.ArrayList<>();
    //     List<String> errors = new java.util.ArrayList<>();

    //     for (MultipartFile file : files) {
    //         if (file.isEmpty()) {
    //             continue;
    //         }
            
    //         try {
    //             // Upload file lên Cloudinary
    //             String fileUrl = cloudinaryService.uploadImage(file);

    //             // Lưu MedicalRecord với Cloudinary URL
    //             MedicalRecord rec = MedicalRecord.builder()
    //                     .member(member)
    //                     .fileLink(fileUrl) // Lưu Cloudinary URL thay vì local path
    //                     .recordDate(LocalDateTime.now())
    //                     .build();
    //             medicalRecordRepository.save(rec);
    //             uploadedUrls.add(fileUrl);
    //         } catch (IOException e) {
    //             errors.add("Failed to upload " + file.getOriginalFilename() + ": " + e.getMessage());
    //         } catch (Exception e) {
    //             errors.add("Error uploading " + file.getOriginalFilename() + ": " + e.getMessage());
    //         }
    //     }

    //     if (errors.isEmpty()) {
    //         return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "ok", "uploaded", uploadedUrls.size()));
    //     } else if (uploadedUrls.isEmpty()) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //                 .body(Map.of("error", "All uploads failed", "errors", errors));
    //     } else {
    //         return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
    //                 .body(Map.of("status", "partial", "uploaded", uploadedUrls.size(), "errors", errors));
    //     }
    // }

    /**
     * Lấy danh sách files (MedicalRecords) của một member
     */
    @GetMapping("/members/{memberId}/files")
    public ResponseEntity<List<MedicalRecord>> getMemberFiles(@PathVariable Integer memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
        List<MedicalRecord> records = medicalRecordRepository.findByMember_MemberID(memberId);
        
        // Force load các quan hệ để tránh lỗi lazy loading khi serialize
        for (MedicalRecord record : records) {
            if (record.getMember() != null) {
                record.getMember().getFullName(); // Trigger load
            }
            if (record.getDoctor() != null) {
                record.getDoctor().getFullName(); // Trigger load
            }
        }
        
        return ResponseEntity.ok(records);
    }

    @PutMapping("/files/{fileId}")
    public ResponseEntity<MedicalRecord> updateMedicalRecord(
            @PathVariable Integer fileId,
            @RequestBody MedicalRecord updated) {
        MedicalRecord record = medicalRecordRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Medical record not found: " + fileId));
        
        // Cập nhật các trường nếu có
        if (updated.getSymptoms() != null) {
            record.setSymptoms(updated.getSymptoms());
        }
        if (updated.getDiagnosis() != null) {
            record.setDiagnosis(updated.getDiagnosis());
        }
        if (updated.getTreatmentPlan() != null) {
            record.setTreatmentPlan(updated.getTreatmentPlan());
        }
        
        MedicalRecord saved = medicalRecordRepository.save(record);
        return ResponseEntity.ok(saved);
    }

    // @DeleteMapping("/files/{fileId}")
    // public ResponseEntity<?> deleteFile(@PathVariable Integer fileId) {
    //     MedicalRecord rec = medicalRecordRepository.findById(fileId)
    //             .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
        
    //     String fileUrl = rec.getFileLink();
        
    //     // Xóa file khỏi Cloudinary nếu là Cloudinary URL
    //     if (fileUrl != null && fileUrl.contains("cloudinary.com")) {
    //         cloudinaryService.deleteImageFromCloudinary(fileUrl);
    //     }
        
    //     // Xóa record khỏi database
    //     medicalRecordRepository.deleteById(fileId);
        
    //     return ResponseEntity.noContent().build();
    // }

    @PutMapping("/members/{memberId}/assignDoctor")
    public ResponseEntity<?> assignDoctorToMember(@PathVariable Integer memberId, @RequestBody Map<String, Integer> body) {
        Integer doctorId = body.get("doctorId");
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));

        DoctorAssignment assignment = DoctorAssignment.builder()
                .doctor(doctor)
                .family(member.getFamily())
                .status(DoctorAssignment.AssignmentStatus.ACTIVE)
                .build();

        doctorAssignmentRepository.save(assignment);
        return ResponseEntity.ok(Map.of("status", "assigned"));
    }

    // ---------------- Doctors ----------------

    @GetMapping("/doctors")
    public List<User> listDoctors() {
        return adminService.listAllDoctors();
    }

    @PostMapping("/doctors")
    public ResponseEntity<User> createDoctor(@RequestBody User payload) {
        // Expecting full payload (including email & password). If missing, reject.
        if (payload.getEmail() == null || payload.getPasswordHash() == null) {
            return ResponseEntity.badRequest().build();
        }
        // create via AdminService to ensure password encoding
        User created = adminService.createUser(payload, payload.getPasswordHash());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/doctors/{id}")
    public User updateDoctor(@PathVariable Integer id, @RequestBody User payload) {
        return adminService.updateUser(id, payload);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Families ----------------

    @GetMapping("/families")
    public List<Family> listFamilies() {
        return familyRepository.findAllWithHeadOfFamily();
    }

    @PostMapping("/families")
    public ResponseEntity<Family> createFamily(@RequestBody Family payload) {
        Family saved = familyRepository.save(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/families/{id}")
    public Family updateFamily(@PathVariable Integer id, @RequestBody Family payload) {
        Family existing = familyRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Family not found: " + id));
        if (payload.getFamilyName() != null) existing.setFamilyName(payload.getFamilyName());
        if (payload.getAddress() != null) existing.setAddress(payload.getAddress());
        return familyRepository.save(existing);
    }

    @DeleteMapping("/families/{id}")
    public ResponseEntity<Void> deleteFamily(@PathVariable Integer id) {
        familyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Doctor Requests ----------------

    @GetMapping("/doctor-requests")
    public List<DoctorRequest> listDoctorRequests(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            try {
                // Convert từ string sang enum (database uses Pending, Accepted, Rejected)
                // Hỗ trợ cả uppercase, lowercase và capitalized
                String normalizedStatus = status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
                DoctorRequest.RequestStatus requestStatus = DoctorRequest.RequestStatus.valueOf(normalizedStatus);
                return adminService.listDoctorRequestsByStatus(requestStatus);
            } catch (IllegalArgumentException e) {
                // Nếu không parse được, trả về tất cả
                return adminService.listAllDoctorRequests();
            }
        }
        return adminService.listAllDoctorRequests();
    }

    @GetMapping("/doctor-requests/{id}")
    public DoctorRequest getDoctorRequestById(@PathVariable Integer id) {
        return adminService.getDoctorRequestById(id);
    }

    @PutMapping("/doctor-requests/{id}/approve")
    public ResponseEntity<User> approveDoctorRequest(@PathVariable Integer id) {
        User doctor = adminService.verifyDoctorRequest(id, true);
        return ResponseEntity.ok(doctor);
    }

    @PutMapping("/doctor-requests/{id}/reject")
    public ResponseEntity<Void> rejectDoctorRequest(@PathVariable Integer id) {
        adminService.verifyDoctorRequest(id, false);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Payments ----------------

    @GetMapping("/payments")
    public List<Payment> listPayments(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return adminService.listPaymentsByStatus(status.toUpperCase());
        }
        return adminService.listAllPayments();
    }

    @GetMapping("/payments/{id}")
    public Payment getPaymentById(@PathVariable Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + id));
        // Đảm bảo user được load
        if (payment.getUser() != null) {
            org.hibernate.Hibernate.initialize(payment.getUser());
        }
        return payment;
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> createPayment(@RequestBody Map<String, Object> payload) {
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal(0));
        payment.setPaymentStatus(Payment.PaymentStatus.Pending);
        payment.setPaymentMethod(null);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setExpiryDate(LocalDateTime.now().plusMonths(1));
        payment.setTransactionCode(null);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        // Xử lý familyID: có thể là nested object hoặc direct ID
        Integer familyID = extractFamilyID(payload);
        
        // Xử lý doctorID: có thể là nested object hoặc direct ID
        Integer doctorID = extractDoctorID(payload);
        
        // Set family và doctor từ IDs
        if (familyID != null) {
            final Integer finalFamilyID = familyID;
            Family family = familyRepository.findById(finalFamilyID)
                    .orElseThrow(() -> new IllegalArgumentException("Family not found: " + finalFamilyID));
            payment.setUser(family.getHeadOfFamily());
            // Set userID từ headOfFamilyID nếu chưa có
            if (family.getHeadOfFamily() != null) {
                payment.setUser(family.getHeadOfFamily());
            }
        }
        
        if (doctorID != null) {
            final Integer finalDoctorID = doctorID;
            User doctor = userRepository.findById(finalDoctorID)
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + finalDoctorID));
            payment.setUser(doctor);
        }
        
        // Set các trường khác từ payload
        if (payload.containsKey("amount")) {
            Object amountObj = payload.get("amount");
            if (amountObj instanceof Number) {
                payment.setAmount(BigDecimal.valueOf(((Number) amountObj).doubleValue()));
            } else if (amountObj instanceof String) {
                payment.setAmount(BigDecimal.valueOf(Double.parseDouble((String) amountObj)));
            }
        }
        
        if (payload.containsKey("paymentMethod")) {
            payment.setPaymentMethod((String) payload.get("paymentMethod"));
        }
        
        if (payload.containsKey("paymentStatus")) {
            payment.setPaymentStatus(Payment.PaymentStatus.valueOf((String) payload.get("paymentStatus")));
        } else if (payload.containsKey("status")) {
            payment.setPaymentStatus(Payment.PaymentStatus.valueOf((String) payload.get("status")));
        } else {
            payment.setPaymentStatus(Payment.PaymentStatus.Pending);
        }
        
        // Nếu vẫn chưa có userID, set từ doctorID hoặc familyID
        if (payment.getUser() == null && payment.getUser() != null) {
            payment.setUser(payment.getUser());
        }
        
        Payment created = paymentRepository.save(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Integer id) {
        paymentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper methods để extract IDs từ payload
    private Integer extractFamilyID(Map<String, Object> payload) {
        if (payload.containsKey("familyID")) {
            Object familyIDObj = payload.get("familyID");
            if (familyIDObj instanceof Number) {
                return ((Number) familyIDObj).intValue();
            } else if (familyIDObj instanceof String) {
                return Integer.parseInt((String) familyIDObj);
            }
        } else if (payload.containsKey("family")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> familyMap = (Map<String, Object>) payload.get("family");
            if (familyMap != null && familyMap.containsKey("familyID")) {
                Object familyIDObj = familyMap.get("familyID");
                if (familyIDObj instanceof Number) {
                    return ((Number) familyIDObj).intValue();
                }
            }
        }
        return null;
    }

    private Integer extractDoctorID(Map<String, Object> payload) {
        if (payload.containsKey("doctorID")) {
            Object doctorIDObj = payload.get("doctorID");
            if (doctorIDObj instanceof Number) {
                return ((Number) doctorIDObj).intValue();
            } else if (doctorIDObj instanceof String) {
                return Integer.parseInt((String) doctorIDObj);
            }
        } else if (payload.containsKey("doctor")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> doctorMap = (Map<String, Object>) payload.get("doctor");
            if (doctorMap != null && doctorMap.containsKey("userID")) {
                Object doctorIDObj = doctorMap.get("userID");
                if (doctorIDObj instanceof Number) {
                    return ((Number) doctorIDObj).intValue();
                }
            }
        }
        return null;
    }

}
