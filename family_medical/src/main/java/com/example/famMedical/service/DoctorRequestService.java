package com.example.famMedical.service;

import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import com.example.famMedical.Entity.DoctorRequest;
import com.example.famMedical.Entity.DoctorRequest.RequestStatus;
import com.example.famMedical.Entity.Family;
import com.example.famMedical.Entity.User;
import com.example.famMedical.repository.DoctorRequestRepository;
import com.example.famMedical.repository.FamilyRepository;
import com.example.famMedical.repository.UserRepository;
@Service
@AllArgsConstructor
public class DoctorRequestService {
    private final DoctorRequestRepository doctorRequestRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;

    public DoctorRequest createDoctorRequest(String doctorID, String userID){
        int docID = Integer.parseInt(doctorID);
        Integer uID = Integer.parseInt(userID);

        User u1 = userRepository.findById(docID)
        .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + docID)); 

        Family f2 = familyRepository.findByHeadOfFamily_UserID(uID)
        .orElseThrow(() -> new IllegalArgumentException("family not found with ID: " + docID)); 
        // System.out.println(f2.get);
         
        DoctorRequest newRequest = new DoctorRequest();
        newRequest.setFamily(f2);
        newRequest.setDoctor(u1);
        newRequest.setFamily(f2);

        newRequest.setStatus(RequestStatus.Pending);    

        System.out.println("thêm thành công doctor request");
        return doctorRequestRepository.save(newRequest);

    }

    // public DoctorRequest upaDoctorRequest(String)

} 