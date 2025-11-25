package com.example.famMedical.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.logging.Logger;

import org.hibernate.validator.internal.util.logging.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;

import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;


@Service
@AllArgsConstructor
@Slf4j
public class DoctorRequestService {
    private final DoctorRequestRepository doctorRequestRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;

    public DoctorRequest createDoctorRequest(String doctorID, String userID){
        int docID = Integer.parseInt(doctorID);
        Integer uID = Integer.parseInt(userID);

        User u1 = userRepository.findById(docID)
        .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + docID)); 

        Family f2 = familyRepository.findByHeadOfFamily_UserID(uID);
        // .orElseThrow(() -> new IllegalArgumentException("family not found with ID: " + docID)); 
        // System.out.println(f2.get);
         
        DoctorRequest newRequest = new DoctorRequest();
        newRequest.setFamily(f2);
        newRequest.setDoctor(u1);
        newRequest.setFamily(f2);

        newRequest.setStatus(RequestStatus.PENDING);    

        System.out.println("thêm thành công doctor request");
        return doctorRequestRepository.save(newRequest);

    }


    // Thêm custom query để giảm N+1 queries
    public DoctorRequest getDoctorRequestDetail(Integer requestId, Integer doctorId) {
        DoctorRequest request = doctorRequestRepository
            .findByIdWithDoctor(requestId) // JOIN FETCH doctor
            .orElseThrow(() -> new NotFoundException("Doctor request not found with id: " + requestId));
        
        validateDoctorAuthorization(request, doctorId);
        return request;
    }

    @Transactional
    public DoctorRequest respondToRequest(
        Integer requestId,
        Integer doctorId,
        DoctorRequest.RequestStatus status,
        String message
    ) {
        // Lấy request với pessimistic lock để tránh race condition
        DoctorRequest request = doctorRequestRepository
            .findByIdWithLock(requestId)
            .orElseThrow(() -> new NotFoundException("Doctor request not found with id: " + requestId));
        
        validateDoctorAuthorization(request, doctorId);
        validateRequestStatus(request);
        
        // Set common fields
        request.setResponseMessage(message);
        request.setResponseDate(LocalDateTime.now());
        
        // Process based on status
        return status == RequestStatus.ACCEPTED 
            ? acceptRequest(request) 
            : rejectRequest(request);
    }

    private void validateDoctorAuthorization(DoctorRequest request, Integer doctorId) {
        User requestDoctor = request.getDoctor();
        if (requestDoctor == null || !requestDoctor.getUserID().equals(doctorId)) {
            log.warn("Unauthorized access attempt by doctor {} for request {}", 
                doctorId, request.getRequestID());
            throw new AuthException("Not authorized to view this request");
        }
    }

    private void validateRequestStatus(DoctorRequest request) {
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException(
                String.format("Cannot process request with status %s. Only PENDING requests can be processed", 
                    request.getStatus())
            );
        }
    }

    private DoctorRequest acceptRequest(DoctorRequest request) {
        request.setStatus(RequestStatus.ACCEPTED);
        
        // Tạo assignment và save cả 2 entities trong 1 transaction
        DoctorAssignment assignment = DoctorAssignment.builder()
            .doctor(request.getDoctor())
            .family(request.getFamily())
            .status(AssignmentStatus.ACTIVE)
            .build();
        
        doctorAssignmentRepository.save(assignment);
        DoctorRequest savedRequest = doctorRequestRepository.save(request);
        
        log.info("Created DoctorAssignment - Doctor: {}, Family: {}", 
            request.getDoctor().getUserID(), 
            request.getFamily().getFamilyID());

        return savedRequest;
    }

    private DoctorRequest rejectRequest(DoctorRequest request) {
        request.setStatus(RequestStatus.REJECTED);
        return doctorRequestRepository.save(request);
    }
}