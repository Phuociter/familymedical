package com.example.famMedical.service;

import java.time.LocalDateTime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.DoctorAssignment;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.dto.events.DoctorRequestStatusChangedEvent;
import com.example.famMedical.exception.AuthException;
import com.example.famMedical.exception.NotFoundException;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.DoctorAssignmentRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;
import java.util.Optional;
import jakarta.transaction.Transactional;


@Service
@AllArgsConstructor
@Slf4j
public class DoctorRequestService {
    private final DoctorRequestRepository doctorRequestRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final MessageService messageService;


    public DoctorRequest getDoctorRequestByFamilyId(Integer familyId){
        DoctorRequest request = doctorRequestRepository.findTopByFamily_FamilyIDOrderByRequestDateDesc(familyId);
        if (request == null) {
            System.out.println("No accepted doctor request found for family ID: " + familyId);
            return null;
        }   
        return request;
    }

    public Boolean deleteDoctorRequest(Integer requestID) {
        Optional<DoctorRequest> optionalRequest = doctorRequestRepository.findById(requestID);
        
        if(optionalRequest.isPresent()) {
            doctorRequestRepository.delete(optionalRequest.get());
            return true; // xóa thành công
        } else {
            // không tìm thấy request, trả false thay vì ném exception
            return false;
        }
    }


    public DoctorAssignment getDoctorAssignmentByFamilyId(Integer familyId){
        return doctorAssignmentRepository.findTopByFamily_FamilyIDOrderByStartDateDesc(familyId);
    }

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
        newRequest.setStatus(RequestStatus.PENDING);
        newRequest.setRequestDate(LocalDateTime.now()); // Set explicitly

        // System.out.println("thêm thành công doctor request");
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

        // Tự động tạo conversation giữa bác sĩ và gia đình (nếu chưa có)
        try {
            messageService.getOrCreateConversation(
                request.getDoctor().getUserID(), 
                request.getFamily().getFamilyID()
            );
            log.info("Created/Retrieved Conversation - Doctor: {}, Family: {}", 
                request.getDoctor().getUserID(), 
                request.getFamily().getFamilyID());
        } catch (Exception e) {
            log.error("Failed to create conversation for Doctor: {}, Family: {}. Error: {}", 
                request.getDoctor().getUserID(), 
                request.getFamily().getFamilyID(),
                e.getMessage());
            // Không throw exception để không ảnh hưởng đến việc accept request
            // Conversation có thể được tạo sau khi gửi tin nhắn đầu tiên
        }

        // Publish event for notification
        eventPublisher.publishEvent(new DoctorRequestStatusChangedEvent(this, savedRequest));

        return savedRequest;
    }

    private DoctorRequest rejectRequest(DoctorRequest request) {
        request.setStatus(RequestStatus.REJECTED);
        DoctorRequest savedRequest = doctorRequestRepository.save(request);
        
        // Publish event for notification
        eventPublisher.publishEvent(new DoctorRequestStatusChangedEvent(this, savedRequest));
        
        return savedRequest;
    }
}