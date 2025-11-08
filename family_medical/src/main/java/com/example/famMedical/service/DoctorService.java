package com.example.famMedical.service;

import com.example.famMedical.Entity.*;
import com.example.famMedical.dto.FileDownload;
import com.example.famMedical.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final FamilyRepository familyRepository;
    private final MemberRepository memberRepository;
    private final DoctorRequestRepository doctorRequestRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public List<Family> getMyPatientsFamily() {
        // Lấy thông tin bác sĩ hiện tại từ authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorEmail = auth.getName();
        
        Optional<User> doctorOpt = userRepository.findByEmail(doctorEmail);
        if (doctorOpt.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }
        
        User doctor = doctorOpt.get();
        
        // Lấy danh sách gia đình mà bác sĩ có quyền truy cập
        List<Family> accessibleFamilies = familyRepository.findFamiliesAssignedToDoctor(doctor);
        
        // // Nếu có familyId cụ thể, lọc theo familyId đó
        // if (familyId != null) {
        //     return accessibleFamilies.stream()
        //             .filter(family -> family.getFamilyID().equals(familyId))
        //             .toList();
        // }
        
        return accessibleFamilies;
    }

    public Member getDetailPatient(Integer memberId) {
        // Lấy thông tin bác sĩ hiện tại
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorEmail = auth.getName();
        
        Optional<User> doctorOpt = userRepository.findByEmail(doctorEmail);
        if (doctorOpt.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }
        
        User doctor = doctorOpt.get();
        
        Optional<Member> memberOpt = memberRepository.findById(memberId);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("Member not found");
        }
        
        Member member = memberOpt.get();
        
        // Kiểm tra quyền truy cập của bác sĩ đối với thành viên này
        List<Member> accessibleMembers = memberRepository.findMembersAccessibleByDoctor(doctor.getUserID());
        boolean hasAccess = accessibleMembers.stream()
                .anyMatch(m -> m.getMemberID().equals(memberId));
        
        if (!hasAccess) {
            throw new RuntimeException("Access denied: Doctor does not have permission to view this patient");
        }
        
        return member;
    }

    public DoctorRequest getRequestForDoctor() {
        // Lấy thông tin bác sĩ hiện tại
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorEmail = auth.getName();
        
        Optional<User> doctorOpt = userRepository.findByEmail(doctorEmail);
        if (doctorOpt.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }
        
        User doctor = doctorOpt.get();
        
        // Lấy các request đang chờ xử lý (PENDING) trước
        List<DoctorRequest> pendingRequests = doctorRequestRepository.findPendingRequestsByDoctor(doctor);
        if (!pendingRequests.isEmpty()) {
            return pendingRequests.get(0); // Trả về request pending đầu tiên
        }
        
        // Nếu không có pending, lấy tất cả requests
        List<DoctorRequest> allRequests = doctorRequestRepository.findByDoctor(doctor);
        return allRequests.isEmpty() ? null : allRequests.get(0);
    }

    public FileDownload downloadMedicalRecordFile(String recordId) {
        Integer id = Integer.parseInt(recordId);
        Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(id);
        
        if (recordOpt.isEmpty()) {
            throw new RuntimeException("Medical record not found");
        }
        
        MedicalRecord record = recordOpt.get();
        
        // Kiểm tra quyền truy cập của bác sĩ đối với hồ sơ này
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorEmail = auth.getName();
        
        Optional<User> doctorOpt = userRepository.findByEmail(doctorEmail);
        if (doctorOpt.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }
        
        User doctor = doctorOpt.get();
        List<Member> accessibleMembers = memberRepository.findMembersAccessibleByDoctor(doctor.getUserID());
        boolean hasAccess = accessibleMembers.stream()
                .anyMatch(m -> m.getMemberID().equals(record.getMember().getMemberID()));
        
        if (!hasAccess) {
            throw new RuntimeException("Access denied: Doctor does not have permission to access this medical record");
        }
        
        if (record.getFileLink() == null || record.getFileLink().isEmpty()) {
            throw new RuntimeException("No file attached to this medical record");
        }
        
        // Tạo FileDownload object
        String fileName = "medical_record_" + recordId + ".pdf";
        return new FileDownload(fileName, record.getFileLink(), "application/pdf");
    }
}